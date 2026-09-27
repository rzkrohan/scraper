/*
# Scrape : Downloader All platform (support photo slide)
# Type : ESM
# Url : https://vidssave.com
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/
const axios = require("axios");

async function vidsSave(url) {
  try {
    const params = new URLSearchParams({
      auth: "20250901majwlqo",
      domain: "api-ak.vidssave.com",
      origin: "source",
      link: url
    });

    const { data } = await axios.post(
      "https://api.vidssave.com/api/contentsite_api/media/parse",
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    return data;
  } catch (e) {
    throw e.response?.data || e.message;
  }
}

// Example
(async () => {
  try {
    const res = await vidsSave("https://www.instagram.com/p/DajD3vUkXyO/?igsh=MTM0ZG1wcThocGpvZw==");
    m.reply(JSON.stringify(res, null, 2));
  } catch (e) {
    m.reply(typeof e === "string" ? e : JSON.stringify(e, null, 2));
  }
})();