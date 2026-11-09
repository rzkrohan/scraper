/*
# Scrape : Any Downloader
# Type : CJS
# Url : https://dl.valore.web.id
# Snippet : https://snippet.zellrayy.com/TUAApHEJwL
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/
const axios = require("axios");

async function anyDownload(url) {
  try {
    const { data } = await axios.post(
      "https://dl.valore.web.id/api/download",
      { url },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id":
            "sid_" + Math.random().toString(36).slice(2) + Date.now().toString(36),
        },
      }
    );

    return data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
}

// Cintoh nyeee
anyDownload("https://vt.tiktok.com/ZSX1pw9PJ/")
  .then((res) => m.reply(JSON.stringify(res, null, 2)))
  .catch((err) =>
    m.reply(
      typeof err === "string" ? err : JSON.stringify(err, null, 2)
    )
  );