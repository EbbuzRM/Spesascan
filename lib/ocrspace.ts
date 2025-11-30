import sharp from 'sharp'

async function compressImageIfNeeded(file: File): Promise<Buffer> {
    const buffer = Buffer.from(await file.arrayBuffer())

    if (buffer.length <= 900 * 1024) {
        console.log("[OCRSpace] File size OK:", (buffer.length / 1024).toFixed(0), "KB")
        return buffer
    }

    console.log("[OCRSpace] File too large:", (buffer.length / 1024).toFixed(0), "KB - compressing...")

    const image = sharp(buffer)
    const metadata = await image.metadata()

    let processedImage = image

    if (metadata.width && metadata.width > 2000) {
        processedImage = processedImage.resize(2000, null, {
            withoutEnlargement: true,
            fit: 'inside'
        })
    }

    const compressed = await processedImage.jpeg({ quality: 80 }).toBuffer()

    console.log("[OCRSpace] Compressed:", (buffer.length / 1024).toFixed(0), "KB →", (compressed.length / 1024).toFixed(0), "KB")

    if (compressed.length > 900 * 1024) {
        console.log("[OCRSpace] Still too large, reducing quality to 60...")
        const moreCompressed = await sharp(buffer)
            .resize(1600, null, { withoutEnlargement: true, fit: 'inside' })
            .jpeg({ quality: 60 })
            .toBuffer()

        console.log("[OCRSpace] Final size:", (moreCompressed.length / 1024).toFixed(0), "KB")
        return moreCompressed
    }

    return compressed
}

export async function processWithOCRSpace(
    file: File,
    apiKey: string,
): Promise<number | null> {
    try {
        const compressedBuffer = await compressImageIfNeeded(file)

        // Convert Buffer to Uint8Array for File constructor
        const compressedFile = new File([new Uint8Array(compressedBuffer)], file.name, { type: 'image/jpeg' })

        const formData = new FormData()
        formData.append("file", compressedFile)
        formData.append("apikey", apiKey)
        formData.append("language", "ita")
        formData.append("isOverlayRequired", "false")
        formData.append("detectOrientation", "true")
        formData.append("scale", "true")
        formData.append("OCREngine", "2")

        console.log("[OCRSpace] Uploading image for text extraction...")

        const response = await fetch("https://api.ocr.space/parse/image", {
            method: "POST",
            body: formData,
        })

        const data = await response.json()

        if (!data.IsErroredOnProcessing && data.ParsedResults && data.ParsedResults.length > 0) {
            const text = data.ParsedResults[0].ParsedText
            console.log("[OCRSpace] Extracted text length:", text.length)
            console.log("[OCRSpace] Full text:\n", text)

            // 1. Try strict patterns first (Label immediately followed by value)
            const strictPatterns = [
                /TOTALE\s+COMPLESSIVO[:\s]*(\d+)[,.](\d+)/i,
                /TOTALE\s+COMPLESSIVO[:\s]*(\d+),(\d+)/i,
                /TOTALE[:\s]*(\d+)[,.](\d+)/i,
                /TOTAL[:\s]*(\d+)[,.](\d+)/i,
                /TOTALE\s+SCONTRINO[:\s]*(\d+)[,.](\d+)/i,
                /TOTALE\s*[\r\n]+\s*COMPLESSIVO[\s:\r\n]*(\d+)[,.](\d+)/i,
                /TOTALE[\s:\r\n]+(\d+)[,.](\d+)/i,
            ]

            for (const pattern of strictPatterns) {
                const match = text.match(pattern)
                if (match) {
                    const euros = parseInt(match[1])
                    const cents = parseInt(match[2])
                    const total = euros + cents / 100
                    console.log("[OCRSpace] ✓ Found total (strict):", match[0].trim(), "=", total, "€")
                    return total
                }
            }

            // 2. Fallback: Look for "TOTALE" and then find the first valid price number that appears after it
            // This handles cases where the value is visually aligned but textually separated (e.g. by other columns)
            console.log("[OCRSpace] Strict patterns failed, trying loose search...")

            const totalLabelMatch = text.match(/TOTALE\s+COMPLESSIVO|TOTALE/i)
            if (totalLabelMatch && totalLabelMatch.index !== undefined) {
                const textAfterLabel = text.substring(totalLabelMatch.index + totalLabelMatch[0].length)

                // Look for numbers that look like prices (e.g. 38,78 or 38.78 or 38, 78)
                // We look for the first few matches to avoid picking up unrelated numbers too far away
                const priceRegex = /(\d+)\s*[,.]\s*(\d{2})\b/g
                let match
                let bestCandidate = null

                // Check the first 3 number matches after the label
                let checks = 0
                while ((match = priceRegex.exec(textAfterLabel)) !== null && checks < 5) {
                    const euros = parseInt(match[1])
                    const cents = parseInt(match[2])
                    const amount = euros + cents / 100

                    console.log(`[OCRSpace] Found candidate value after total: ${match[0]} = ${amount}`)

                    // Simple heuristic: usually the total is the largest number found in the footer
                    // Or simply the first one if it's close. Let's take the first one that looks "plausible" (>0)
                    if (amount > 0) {
                        bestCandidate = amount
                        break // Take the first valid price found after "TOTALE"
                    }
                    checks++
                }

                if (bestCandidate) {
                    console.log("[OCRSpace] ✓ Found total (loose search):", bestCandidate, "€")
                    return bestCandidate
                }
            }

            console.log("[OCRSpace] ⚠️ Could not find total with any pattern")
            return null
        } else {
            console.error("[OCRSpace] Error:", data.ErrorMessage || data)
            return null
        }
    } catch (error) {
        console.error("[OCRSpace] Exception:", error)
        return null
    }
}
