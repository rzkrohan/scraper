/*
# Scrape : Upacale Photo
# Type : Esm
# Url : https://imgupscaler.com
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/

import axios from "axios"
import FormData from "form-data"
import fs from "fs"

async function upscale(image, scale = "2") {
  const form = new FormData()

  if (/^https?:\/\//.test(image)) {
    const { data } = await axios.get(image, {
      responseType: "arraybuffer"
    })
    form.append("file", Buffer.from(data), "image.jpg")
  } else {
    form.append("file", fs.createReadStream(image))
  }

  const headers = {
    ...form.getHeaders(),
    Origin: "https://imgupscaler.com",
    Referer: "https://imgupscaler.com/",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
  }

  const { data: upload } = await axios.post(
    "https://imgupscaler.com/api/legacy/upload",
    form,
    { headers }
  )

  if (!upload.taskId) throw new Error("Upload gagal")

  while (true) {
    await new Promise(resolve => setTimeout(resolve, 3000))

    const { data: status } = await axios.post(
      "https://imgupscaler.com/api/legacy/status",
      {
        tool: "upscaler",
        taskId: upload.taskId,
        scaleRadio: String(scale)
      },
      {
        headers: {
          "Content-Type": "application/json",
          Origin: "https://imgupscaler.com",
          Referer: "https://imgupscaler.com/",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36"
        }
      }
    )

    if (status.status === "success") {
      return {
        taskId: upload.taskId,
        filename: status.originalFileName,
        url: status.downloadUrls[0],
        raw: status
      }
    }

    if (status.status === "failed") {
      throw new Error("Upscale gagal")
    }
  }
}

// Contoh
upscale("./image.jpg", 2) // 2x HD - 4xHD
  .then(console.log)
  .catch(console.error)