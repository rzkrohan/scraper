/*
# Scrape : YouTube Video
# Type : CJS
# Url : https://www.sosmedsaver.me
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/
const axios = require("axios");

async function sosmedSaver(url) {
  try {
    const { data } = await axios.get(
      "https://www.sosmedsaver.me/api/info",
      {
        params: {
          url
        },
        headers: {
          Accept: "application/json"
        }
      }
    );

    return data;
  } catch (e) {
    throw e.response?.data || e.message;
  }
}

try {
  const res = await sosmedSaver("https://youtu.be/ObuP-wH0ghA?si=pwdwhVr8cZLBgXAh");
  m.reply(JSON.stringify(res, null, 2));
} catch (e) {
  m.reply(
    typeof e === "object"
      ? JSON.stringify(e, null, 2)
      : String(e)
  );
}