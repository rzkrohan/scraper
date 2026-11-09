/*
# Scrape : Feelbetterbot Ai
# Type : CJS
# Url : https://feelbetterbot.com
# Snippet : https://snippet.zellrayy.com/w9QYPK4KTg
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/
const axios = require("axios");

async function feelBetterChat(prompt) {
  try {
    const { data } = await axios.post(
      "https://feelbetterbot.com/",
      {
        messages: [
          {
            role: "assistant",
            content:
              "Hi, I'm FeelBetterBot — I'm here to listen and help you through whatever's on your mind, drawing on real tools that can make a difference. I’m not here to judge or rush you; just to be present with whatever you bring, one step at a time. How are you doing today?"
          },
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36"
        },
        responseType: "text"
      }
    );

    return {
      success: true,
      message: data.trim()
    };
  } catch (e) {
    return {
      success: false,
      error: e.response?.data || e.message
    };
  }
}

// Contoh
(async () => {
  const res = await feelBetterChat("hi");

  if (!res.success) {
    return m.reply(JSON.stringify(res.error, null, 2));
  }

  m.reply(res.message);
})();