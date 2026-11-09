/*
# Name : YouTube Video Downloader
# Type : CJS
# Url : https://nevercap.ai
# Snippet : https://snippet.zellrayy.com/tYjk9M5vz8
# Source : https://whatsapp.com/channel/0029VbDWBmtA89MamPba8q3f
*/

const axios = require("axios")

async function ytmp4(url) {
  try {

    const headers = {
      "content-type": "application/json",
      "user-agent": "Mozilla/5.0"
    }

    const start = await axios.post(
      "https://nevercap.ai/wapi/fileServer/file/file/uploadUrlOpen",
      {
        url: url,
        parentId: -1
      },
      { headers }
    )

    if (!start.data?.success) throw "Gagal mendapatkan ID"

    const id = start.data.data.id

    let fileUrl = null
    let meta = null

    for (let i = 0; i < 15; i++) {

      const check = await axios.post(
        "https://nevercap.ai/wapi/fileServer/file/file/uploadUrlStatusOpen",
        { id },
        { headers }
      )

      meta = check.data?.data?.fileMetaInfo

      if (meta?.fileUrl) {
        fileUrl = meta.fileUrl
        break
      }

      await new Promise(r => setTimeout(r, 2000))
    }

    if (!fileUrl) throw "File tidak ditemukan"

    return {
      id: meta.id,
      title: meta.fileName,
      size: meta.fileSize,
      type: meta.fileType,
      url: meta.fileUrl
    }

  } catch (e) {
    console.error(e)
    return null
  }
}
