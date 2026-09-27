/*
# Scrape : TEMP MAIL
# Type : CJS
# Url : https://temp-mail.io/en
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/

// # CREATE NEW EMAIL
const axios = require("axios");

(async () => {
  try {
    const BASE_URL = "https://api.internal.temp-mail.io/api/v3";

    const headers = {
      "Content-Type": "application/json",
      "Application-Name": "web",
      "Application-Version": "4.0.0",
      "X-CORS-Header": "iaWg3pchvFx48fY",
    };

    const { data: create } = await axios.post(
      `${BASE_URL}/email/new`,
      {
        min_name_length: 10,
        max_name_length: 10,
      },
      { headers }
    );

    const { data: inbox } = await axios.get(
      `${BASE_URL}/email/${create.email}/messages`,
      { headers }
    );

    m.reply(
      JSON.stringify(
        {
          create,
          inbox,
        },
        null,
        2
      )
    );
  } catch (e) {
    m.reply(
      JSON.stringify(
        e.response?.data || {
          message: e.message,
          status: e.response?.status,
        },
        null,
        2
      )
    );
  }
})();

// # CHEK MESSAGE EMAIL
const axios = require("axios");

(async () => {
  try {
    const email = "email@domain.com"; // ganti bae sama yang tadi baru di create

    const { data } = await axios.get(
      `https://api.internal.temp-mail.io/api/v3/email/${encodeURIComponent(email)}/messages`,
      {
        headers: {
          "Content-Type": "application/json",
          "Application-Name": "web",
          "Application-Version": "4.0.0",
          "X-CORS-Header": "iaWg3pchvFx48fY",
        },
      }
    );

    m.reply(JSON.stringify(data, null, 2));
  } catch (e) {
    m.reply(
      JSON.stringify(
        e.response?.data || { message: e.message },
        null,
        2
      )
    );
  }
})();