/*
# Scrape : TikTok Download Support photo slide 
# Type : ESM
# Url : -https://lovetik.com
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/
import axios from "axios";

async function lovetik(url) {
  try {
    const { data } = await axios.post(
      "https://lovetik.com/api/ajax/search",
      new URLSearchParams({
        query: url
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "Accept": "*/*",
          "X-Requested-With": "XMLHttpRequest",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
          "Origin": "https://lovetik.com",
          "Referer": "https://lovetik.com/"
        }
      }
    );

    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

// Contoh penggunaan
const result = await lovetik("https://vt.tiktok.com/ZSX1pw9PJ/");
console.log(JSON.stringify(result, null, 2));