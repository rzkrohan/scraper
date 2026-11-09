/*
# Scrape : YouTube Download photo slide
# Type : CJS
# Url : https://studioseo.tools/youtube-community-posts-downloader
# Snippet : https://snippet.zellrayy.com/RRqSBdfKvs
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/
const axios = require("axios");

async function youtubeCommunity(url) {
  try {
    const { data } = await axios.post(
      "https://studioseo.tools/api/youtube-community",
      { url },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    return data;
  } catch (err) {
    throw err.response?.data || err;
  }
}

(async () => {
  try {
    const result = await youtubeCommunity(
      "https://youtube.com/post/UgkxtWvWsPJc5Uq71URJjIUwskVVgaqMBG8B?si=gbyboi8-2MNJIW_e"
    );

    const images = result.images.map((img) => ({
      original: img.original.startsWith("//")
        ? "https:" + img.original
        : img.original,
      max: img.resolutions.at(-1)?.url.startsWith("//")
        ? "https:" + img.resolutions.at(-1).url
        : img.resolutions.at(-1)?.url,
      resolutions: img.resolutions.map((r) => ({
        width: r.width,
        height: r.height,
        url: r.url.startsWith("//") ? "https:" + r.url : r.url,
      })),
    }));

    m.reply(
      JSON.stringify(
        {
          total: result.total,
          images,
        },
        null,
        2
      )
    );
  } catch (e) {
    m.reply(JSON.stringify(e, null, 2));
  }
})();