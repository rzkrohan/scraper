/*
# Scrape : GPT-5.4 Mini (SurfSense)
# Type : CJS
# Url : https://surfsense.com
# Snippet : https://snippet.zellrayy.com/y8nv9S4Qpm
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/
const axios = require("axios");

async function Ai(prompt) {
  try {
    const { data: stream } = await axios({
      method: "POST",
      url: "https://api.surfsense.com/api/v1/public/anon-chat/stream",
      headers: {
        "Content-Type": "application/json"
      },
      data: {
        model_slug: "gpt-5.4-mini-no-login",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      },
      responseType: "stream"
    });

    return await new Promise((resolve, reject) => {
      let buffer = "";
      let text = "";

      stream.on("data", chunk => {
        buffer += chunk.toString();

        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (let line of lines) {
          line = line.trim();
          if (!line.startsWith("data:")) continue;

          const raw = line.slice(5).trim();

          if (raw === "[DONE]") return resolve(text);

          try {
            const json = JSON.parse(raw);
            if (json.type === "text-delta") {
              text += json.delta;
            }
          } catch {}
        }
      });

      stream.on("end", () => resolve(text));
      stream.on("error", reject);
    });
  } catch (e) {
    return `Error: ${e.response?.data || e.message}`;
  }
}

(async () => {
  const hasil = await Ai("hi");
  m.reply(hasil);
})();