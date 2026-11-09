/*
# Scrape : Lyrics Search
# Type : CJS
# Url : https://lrclib.net
# Snippet : https://snippet.zellrayy.com/JQm59nAM4Y
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/
const axios = require("axios");

async function searchLyrics(query) {
  try {
    const { data } = await axios.get("https://lrclib.net/api/search", {
      params: { q: query },
      headers: {
        "Content-Type": "application/json"
      }
    });

    return data;
  } catch (e) {
    throw e.response?.data || e;
  }
}

try {
  const query = "senorita"; // Judul lagu nye
  const results = await searchLyrics(query);

  await m.reply(JSON.stringify(results, null, 2));
} catch (e) {
  await m.reply(
    typeof e === "object"
      ? JSON.stringify(e, null, 2)
      : String(e)
  );
}