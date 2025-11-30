// TabScanner processing function - Last updated: 2025-01-25 01:03
export async function processWithTabScanner(
  file: File,
  apiKey: string,
): Promise<{ products: any[]; total: number } | null> {
  try {
    const formData = new FormData()
    formData.append("file", file)

    // 1. Upload receipt
    const uploadRes = await fetch("https://api.tabscanner.com/api/2/process", {
      method: "POST",
      headers: {
        apikey: apiKey,
      },
      body: formData,
    })

    const uploadData = await uploadRes.json()

    if (!uploadData.success) {
      console.error("TabScanner upload failed:", uploadData.message)
      return null
    }

    const token = uploadData.token

    // 2. Poll for results
    let attempts = 0
    const maxAttempts = 10
    const delay = 2000 // 2 seconds

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, delay))

      const resultRes = await fetch(`https://api.tabscanner.com/api/result/${token}`, {
        method: "GET",
        headers: {
          apikey: apiKey,
        },
      })

      const resultData = await resultRes.json()

      if (resultData.status === "done") {
        // 3. Parse results
        if (!resultData.result.lineItems) {
          return { products: [], total: 0 }
        }

        console.log("[TabScanner] Processing", resultData.result.lineItems.length, "items")

        // Log summaryItems - this might contain TOTALE COMPLESSIVO
        if (resultData.result.summaryItems && resultData.result.summaryItems.length > 0) {
          console.log("[TabScanner] Summary items found:", resultData.result.summaryItems.length)
          resultData.result.summaryItems.forEach((item: any, idx: number) => {
            console.log(`  [${idx}] ${item.desc || item.type}: ${item.value}`)
          })
        }

        // Try different fields in order of preference
        let totalInEuros = 0

        // First, try to find "TOTALE" or "TOTAL" in summaryItems
        if (resultData.result.summaryItems && resultData.result.summaryItems.length > 0) {
          const totaleItem = resultData.result.summaryItems.find((item: any) =>
            item.desc && (
              item.desc.toUpperCase().includes('TOTALE COMPLESSIVO') ||
              item.desc.toUpperCase().includes('TOTALE') ||
              item.desc.toUpperCase().includes('TOTAL')
            )
          )

          if (totaleItem && totaleItem.value) {
            // summaryItems values are in cents
            totalInEuros = totaleItem.value / 100
            console.log("[TabScanner] ✓ Found total in summaryItems:", totaleItem.desc, "=", totalInEuros, "€")
          }
        }

        // Fallback to standard fields if no summary item found
        if (totalInEuros === 0) {
          console.log("[TabScanner] Standard fields: total=", resultData.result.total, "validatedTotal=", resultData.result.validatedTotal)
          if (resultData.result.validatedTotal && resultData.result.validatedTotal !== false) {
            totalInEuros = resultData.result.validatedTotal
            console.log("[TabScanner] Using validatedTotal:", totalInEuros)
          } else if (resultData.result.total) {
            totalInEuros = resultData.result.total
            console.log("[TabScanner] Using total:", totalInEuros)
          }
        }

        // Process lineItems
        const products = resultData.result.lineItems.map((item: any) => {
          const originalName = item.descClean || item.desc
          let cleanName = originalName
          // Remove VAT percentages: "22%", "10,00%", "(IVA 22%)", etc.
          cleanName = cleanName
            .replace(/\s*\(?IVA\s*\d+[,.]?\d*%?\)?\s*/gi, '')  // "IVA 22%" or "(IVA 10,00%)"
            .replace(/\s+\d+[,.]?\d*%\s*$/g, '')  // Trailing " 22%" or " 10,00%"
            .replace(/\s*\(\d+[,.]?\d*%\)\s*/g, '')  // "(22%)" or "(10,00%)"
            .trim()

          if (originalName !== cleanName) {
            console.log("[TabScanner] Cleaned:", originalName, "→", cleanName)
          }

          // lineTotal is already in euros (not cents)
          const priceInEuros = item.lineTotal || 0

          return {
            nome: cleanName,
            prezzo: priceInEuros,
            categoria: item.category || "Alimentari",
          }
        })

        // Process summaryItems to find discounts (BUONO, SCONTO, etc.)
        if (resultData.result.summaryItems && resultData.result.summaryItems.length > 0) {
          const discountPatterns = [
            /buono/i,
            /sconto/i,
            /coupon/i,
            /riduzione/i,
            /^sc\d+%/i,  // SC40%, SC20%, etc.
          ]

          resultData.result.summaryItems.forEach((item: any) => {
            const desc = item.desc || item.type || ""
            const descLower = desc.toLowerCase()

            // Check if this summaryItem looks like a discount
            const isDiscount = discountPatterns.some(pattern => pattern.test(descLower))

            if (isDiscount) {
              let discountPrice = 0

              if (item.value !== undefined) {
                // summaryItems values are in cents, convert to euros
                const valueInEuros = item.value / 100
                // If value is already negative, keep it; otherwise make it negative
                discountPrice = valueInEuros > 0 ? -valueInEuros : valueInEuros
              } else {
                // Try to extract value from description
                // Patterns: "BUONO 5E", "BUONO 10E", "SC40%", etc.

                // Match "5E", "10E", etc. (euro amounts)
                const euroMatch = desc.match(/(\d+(?:[.,]\d+)?)\s*e\b/i)
                if (euroMatch) {
                  discountPrice = -parseFloat(euroMatch[1].replace(',', '.'))
                } else {
                  // Match "40%", "20%", etc. (percentage - we can't calculate without subtotal)
                  const percentMatch = desc.match(/(\d+(?:[.,]\d+)?)\s*%/)
                  if (percentMatch) {
                    // We can't calculate percentage without knowing the subtotal
                    // Log it but set to 0 for now
                    console.log("[TabScanner] Found percentage discount in summaryItems but can't calculate:", desc)
                    discountPrice = 0
                  }
                }
              }

              if (discountPrice !== 0) {
                console.log("[TabScanner] Found discount in summaryItems:", desc, "=", discountPrice, "€")

                products.push({
                  nome: desc.trim(),
                  prezzo: discountPrice,
                  categoria: "Sconto",
                })
              }
            }
          })
        }

        return {
          products: products,
          total: totalInEuros,
        }
      } else if (resultData.status !== "pending") {
        console.error("TabScanner processing status:", resultData.status)
        return null
      }

      attempts++
    }

    console.error("TabScanner timeout")
    return null
  } catch (error) {
    console.error("TabScanner error:", error)
    return null
  }
}
