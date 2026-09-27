/*
# Scrape : Spotify Downloader
# Type : CJS
# Url : https://myspoty.app
# Snippet : https://snippet.zellrayy.com/w7YXHFVVpT
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/
const axios = require("axios");

async function spotify(url) {
  try {
    const { data } = await axios.get(
      "https://myspoty.app/api.php",
      {
        params: {
          action: "lookup",
          u: url
        },
        headers: {
          Accept: "application/json"
        }
      }
    );

    if (data.error) throw new Error("Gagal mengambil data.");

    return {
      title: data.title,
      artist: data.artist,
      cover: data.cover,
      download: data.download
    };
  } catch (e) {
    throw e.response?.data || e.message;
  }
}

try {
  const res = await spotify(
    "https://open.spotify.com/intl-id/track/3AAAGS7iM1ekDywqdYMJG2"
  );

  m.reply(JSON.stringify(res, null, 2));

} catch (e) {
  m.reply(
    typeof e === "object"
      ? JSON.stringify(e, null, 2)
      : String(e)
  );
}