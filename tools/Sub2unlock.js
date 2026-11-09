/*
# Scrape : Sub2Unlock
# Type : CJS
# Url : https://sub2unlocksl.com
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/
const axios = require("axios");

async function createShortLink(LinkKunci, LinkResult) {
  try {
    const { data } = await axios.post(
      "https://sub2unlocksl.com/api/overseas/v1/short-link/save",
      {
        platformId: 1,
        productId: 1,
        statisticsNo: 1,
        terminal: "web",
        language: "en",
        linkContent: JSON.stringify({
          "link-1": LinkKunci,
          "link-2": "",
          "link-3": "",
          "link-4": "",
          "link-5": "",
          "link-6": "",
          "file-link": LinkResult
        })
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Accept": "*/*",
          "X-Requested-With": "XMLHttpRequest"
        }
      }
    );

    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

(async () => {
  try {
    const result = await createShortLink(
      "https://tiktok.com/@iamrzk_",
      "https://chat.whatsapp.com/FWFTLxOnK0F6jXsb22mgP2"
    );

    m.reply(JSON.stringify(result, null, 2));
  } catch (e) {
    m.reply(JSON.stringify(e, null, 2));
  }
})();

/*
Result nya seperti ini
{
  "content": {
    "createTime": null,
    "creator": null,
    "id": null,
    "identification": "9d6031b3-99c5-48a7-9d08-c2efa0b491df",
    "lastModifiedTime": null,
    "lastModifier": null,
    "linkContent": null,
    "sysFlag": null
  },
  "msg": null,
  "status": 1
}

Hasil Link nya seperti ini
https://sub2unlocksl.com/views/task/index.html?id=${content.identification}

contoh
https://sub2unlocksl.com/views/task/index.html?id=a65c8506-7a28-4a6b-b73d-e13187a9490c
*/