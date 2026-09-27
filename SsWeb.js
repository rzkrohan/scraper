/*
# Scrape : Screenshot Web FullPage
# Type : CJS
# Url : https://urlbox.com
# Snippet : https://snippet.zellrayy.com/2t36xm659b
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/
const axios = require("axios");

async function urlboxRender(url) {
  try {
    const { data } = await axios.post(
      "https://urlbox.com/api/render",
      {
        url,
        width: 1440,
        height: 1024,
        full_page: true,
        selector: "",
        dark_mode: true,
        hide_cookie_banners: true,
        format: "png"
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    return data;
  } catch (err) {
    if (err.response) return err.response.data;
    throw err;
  }
}

(async () => {
  const result = await urlboxRender("https://kyzorohan.web.id");
  m.reply(JSON.stringify(result, null, 2));
})();