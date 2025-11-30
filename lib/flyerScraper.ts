import { createClient } from "@/lib/supabase/server"
import * as cheerio from "cheerio"

interface Flyer {
  id?: string
  store_name: string
  title: string
  image_url: string
  flyer_url: string
  valid_from?: string
  valid_to?: string
  created_at?: string
}

const allowedStores = [
  'Aldi', 'Bennet', 'C+C', 'Conad', 'Coop', 'Crai', 'Dpiù', 'Ecu',
  'Esselunga', 'Eurospin', 'Famila', "In's", 'Ipercoop', 'Extracoop',
  'Lidl', 'MD', 'Metro', 'Pam', 'PENNY', 'Sigma'
]

const storeNameMap: { [key: string]: string } = {
  'aldi': 'Aldi',
  'bennet': 'Bennet',
  'conad': 'Conad',
  'coop': 'Coop',
  'crai': 'Crai',
  'dpiu': 'Dpiù',
  'ecu': 'Ecu',
  'esselunga': 'Esselunga',
  'eurospin': 'Eurospin',
  'famila': 'Famila',
  'ins': "In's",
  'ipercoop': 'Ipercoop',
  'extracoop': 'Extracoop',
  'lidl': 'Lidl',
  'md-discount': 'MD',
  'md': 'MD',
  'metro': 'Metro',
  'pam': 'Pam',
  'penny-market': 'PENNY',
  'sigma': 'Sigma',
}

export async function scrapeAndSaveFlyers(cityCode: string, userId?: string): Promise<{ count: number, message: string }> {
  const supabase = await createClient()

  console.log(`[FlyerScraper] Scraping flyers for city: ${cityCode}`)

  const response = await fetch("https://www.volantinofacile.it/volantini-iper-supermercati")
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const html = await response.text()
  const $ = cheerio.load(html)

  const scrapedFlyers: Flyer[] = []

  $(".grid-item a").each((_, element) => {
    const $el = $(element)
    const originalUrl = $el.attr("href") || ""

    if (!originalUrl || !originalUrl.includes('/volantino-')) return

    // Estrae il city-code dall'URL originale
    const cityCodeMatch = originalUrl.match(/([a-z]{2}-[a-z-]+-\d+)/)
    if (!cityCodeMatch) return

    const originalCityCode = cityCodeMatch[1]
    
    // Sostituisce il city-code originale con quello dell'utente
    const newUrl = originalUrl.replace(`${originalCityCode}`, `${cityCode}`)

    // Estrae store slug (primo pezzo del path)
    const storeSlug = originalUrl.split('/')[0]
    const storeName = storeNameMap[storeSlug] || storeSlug

    // Filtra solo supermercati consentiti
    const isAllowed = allowedStores.includes(storeName)
    if (!isAllowed) return

    // Estrae titolo e immagine
    const title = $el.find("h2, h3").first().text().trim() ||
                  $el.find("img").attr("alt") ||
                  storeName
    const imageUrl = $el.find("img").first().attr("src") ||
                     $el.find("img").first().attr("data-src") || ""

    const absoluteFlyerUrl = newUrl.startsWith("http")
      ? newUrl
      : `https://www.volantinofacile.it/${newUrl}`

    const absoluteImageUrl = imageUrl.startsWith("http")
      ? imageUrl
      : imageUrl.startsWith("//")
        ? `https:${imageUrl}`
        : `https://www.volantinofacile.it/${imageUrl.startsWith("/") ? imageUrl.substring(1) : imageUrl}`

    // Evita duplicati in memoria
    if (scrapedFlyers.find(f => f.flyer_url === absoluteFlyerUrl)) return

    scrapedFlyers.push({
      store_name: storeName,
      title: title,
      image_url: absoluteImageUrl,
      flyer_url: absoluteFlyerUrl,
    })
  })

  console.log(`[FlyerScraper] Found ${scrapedFlyers.length} flyers for ${cityCode}`)

  if (scrapedFlyers.length === 0) {
    return { count: 0, message: "Nessun volantino trovato per questa città." }
  }

  // Delete existing flyers (to avoid duplicates)
  // NOTE: This deletes ALL flyers. If multiple users have different cities,
  // this needs to be adapted to delete only for the current user's city.
  // For now, assuming single-user context or global flyers.
  await supabase.from("flyers").delete().neq("id", "00000000-0000-0000-0000-000000000000")

  // Insert new flyers
  const { data: insertedFlyers, error: insertError } = await supabase
    .from("flyers")
    .insert(scrapedFlyers)
    .select()

  if (insertError) {
    console.error("[FlyerScraper] Error inserting flyers:", insertError)
    throw new Error("Failed to save flyers")
  }

  return {
    count: insertedFlyers?.length || 0,
    message: `Aggiornati ${insertedFlyers?.length || 0} volantini!`,
  }
}
