/*
# Name : Instagram downloader (support: video/photo Carousel)
# Type : CJS
# Url : https://igexport.com
# Snippet : https://snippet.zellrayy.com/mpZSfFa3j5
# Source : https://whatsapp.com/channel/0029VbDWBmtA89MamPba8q3f
*/
const axios = require('axios')

async function igPhoto(url) {
  if (!url) throw new Error('URL Instagram wajib diisi')

  const { data } = await axios.get('https://igexport.com/api/ig-photo/', {
    params: { url },
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Referer': 'https://igexport.com/'
    },
    timeout: 30000
  })

  if (!data?.ok || !data?.media?.items) {
    throw new Error('Media Instagram tidak ditemukan')
  }

  return data
}

;(async () => {
  try {
    const url = 'https://www.instagram.com/p/DbLHcpVjoDy/?img_index=3&igsh=MXdqNTczaDVobGI5aw=='

    const result = await igPhoto(url)

    let text = `*Instagram Downloader*\n\n`
    text += `Shortcode: ${result.media.shortcode}\n`
    text += `Jumlah Media: ${result.media.items.length}\n\n`

    for (const [i, item] of result.media.items.entries()) {
      text += `${i + 1}. ${item.type}\n`
      text += `${item.url}\n`
      text += `Filename: ${item.filename}\n\n`
    }

    await m.reply(text)
  } catch (err) {
    await m.reply(
      `❌ Gagal mengambil media Instagram\n\n${err.response?.data?.message || err.message}`
    )
  }
})()