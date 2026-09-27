/*
# Name : YouTube Downloader (Fast banget jir)
# Type : CJS
# Url : https://www.clipto.com
# Snippet : https://snippet.zellrayy.com/prmjn2Tz6K
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/
const axios = require('axios');

async function getYoutubeInfo(youtubeUrl) {
  try {
    const response = await axios.post(
      'https://www.clipto.com/api/youtube',
      { url: youtubeUrl },
      {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

(async () => {
  const youtubeUrl = 'https://youtu.be/M7y9sIvMGjw';

  const data = await getYoutubeInfo(youtubeUrl);

  console.log('Title:', data.title);
  console.log('Duration:', data.duration, 'detik');
  console.log('Thumbnail:', data.thumbnail);

  const videos = data.medias.filter(m => m.type === 'video');
  const audios = data.medias.filter(m => m.type === 'audio');

  console.log(`\n=== VIDEO (${videos.length}) ===`);
  videos.forEach(v => {
    console.log(`- ${v.label} (${v.ext}): ${v.url}`);
  });

  console.log(`\n=== AUDIO (${audios.length}) ===`);
  audios.forEach(a => {
    console.log(`- ${a.label} (${a.ext}): ${a.url}`);
  });
})();

module.exports = { getYoutubeInfo };