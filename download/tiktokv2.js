const axios = require('axios');

async function getTikTokInfo(url) {
  const response = await axios.post(
    'https://api.viesnap.com/info',
    { url },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return response.data;
}

(async () => {
  const tiktokUrl = 'https://vt.tiktok.com/ZS437FNcx/';
  const data = await getTikTokInfo(tiktokUrl);

  console.log('Title  :', data.title);
  console.log('Author :', data.author);
  console.log('Source :', data.source);
  console.log('');

  if (data.qualities && data.qualities.audio && data.qualities.audio.cdn_url) {
    console.log('=== Link Audio ===');
    console.log(data.qualities.audio.cdn_url);
    console.log('');
  }

  if (data.images && data.images.length > 0) {
    console.log(`=== Link Gambar (${data.images.length}) ===`);
    data.images.forEach((img, i) => {
      console.log(`${i + 1}. ${img}`);
    });
  }
})();