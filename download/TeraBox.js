/*
# Scrape : Terabox download
# Type : CJS
# Url : https://teradownloadertool.com/
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/

const axios = require("axios");

async function teraDownloader(url) {
  const { data } = await axios.post(
    "https://teradownloadertool.com/api/download",
    { url },
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

  if (!data.success) throw new Error("Gagal mengambil data.");

  return {
    title: data.data.title,
    thumbnail: data.data.thumbnail,
    size: data.data.size,
    duration: data.data.duration,
    download: data.data.qualities
  };
}

const result = await teraDownloader("https://www.terabox.app/wap/share/filelist?surl=8G8ynv10dD8A3gfvVtv_BA");

m.reply(JSON.stringify(result, null, 2));