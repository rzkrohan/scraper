/*
# Scrape : Threads Downloader Support Foto Slide
# Type : ESM
# Url : https://www.threadsdl.app
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/
import axios from "axios";

async function threadsDl(url) {
  try {
    const { data } = await axios.post(
      "https://www.threadsdl.app/api/threads",
      { url },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const media = [];

    for (const item of data.medias || []) {
      if (item.images?.length) {
        media.push(
          ...item.images.map(img => ({
            type: "image",
            url: img.url
          }))
        );
      }

      if (item.videos?.length) {
        media.push({
          type: "video",
          url: (item.videos.find(v => v.type === 101) || item.videos[0]).url
        });
      }
    }

    return {
      username: data.username,
      avatar: data.avatar,
      caption: data.text,
      media
    };
  } catch (err) {
    throw err.response?.data || err.message;
  }
}

// Example
const result = await threadsDl(
  "https://www.threads.com/@koreaplace.id/post/DbHgAlHkx6X?xmt=AQG0jHGkGQmp7avqyZLdCe_8kl56t_1_958hKcrEmBbYhw"
);

m.reply(JSON.stringify(result, null, 2));