/*
# Name : OCR (image to text)
# Type : ESM
# Url : https://ocr.space
# Snippet : https://snippet.zellrayy.com/LpczFqfbrK
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/
async function ocrScrape(buffer, mimeType = "image/jpeg") {
  const imageBase64 = buffer.toString("base64")

  const res = await fetch("https://api.ocr.space/parse/image", {
    method: "POST",
    headers: {
      apikey: "helloworld"
    },
    body: new URLSearchParams({
      base64Image: `data:${mimeType};base64,${imageBase64}`,
      language: "eng",
    })
  })

  if (!res.ok) throw new Error(await res.text())

  const json = await res.json()

  const result = json?.ParsedResults?.[0]?.ParsedText?.trim() || "Teks tidak ditemukan."

  return result
}

export default ocrScrape