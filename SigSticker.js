/*
# Scrape : Sticker Telegram Search
# Type : CJS
# Url : https://www.sigstick.com
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/
const axios = require('axios');

async function searchSigStickStickers(keyword) {
  const buildId = 'xmei9-YDoRstbl8UC-wWt'; // build id next.js, bisa berubah sewaktu-waktu
  const apiUrl = `https://www.sigstick.com/_next/data/${buildId}/stickers.json`;

  try {
    const response = await axios.get(apiUrl, {
      params: { keyword },
      headers: {
        'x-nextjs-data': '1',
        'Accept': 'application/json',
      },
    });

    const packs = response.data?.pageProps?.packs || [];

    if (packs.length === 0) {
      throw new Error('Tidak ada hasil ditemukan untuk keyword tersebut');
    }

    return packs;
  } catch (err) {
    throw new Error('Gagal mengambil data sticker: ' + err.message);
  }
}

// Contoh penggunaan
(async () => {
  try {
    const keyword = 'Spider-Man';
    const packs = await searchSigStickStickers(keyword);

    m.reply(`Ditemukan ${packs.length} sticker pack untuk "${keyword}"`);

    let teks = '';
    packs.forEach((pack, i) => {
      teks += `${i + 1}. ${pack.title} (${pack.stickers.length} stiker)\n${pack.telegramUrl || '-'}\n\n`;
    });

    m.reply(teks.trim());
  } catch (err) {
    m.reply('Gagal: ' + err.message);
  }
})();