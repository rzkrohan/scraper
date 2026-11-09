/*
# Name : Capcut downloader
# Type : CJS
# Url : https://capdownloader.com
# Snippet : https://snippet.zellrayy.com/7qCux6J7Vv
# Source : https://whatsapp.com/channel/0029VbDWBmtA89MamPba8q3f
*/

const axios = require('axios')

try {
  const capcutUrl = 'https://www.capcut.com/tv2/ZSbXwxMsu/'

  const res = await axios.post(
    'https://capdownloader.com/api/video-data.php',
    `url=${encodeURIComponent(capcutUrl)}`,
    {
      headers: {
        accept: '*/*',
        'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
        origin: 'https://capdownloader.com',
        referer: 'https://capdownloader.com/id/',
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
      },
      timeout: 30000
    }
  )

  const data = res.data

  if (!data || !Array.isArray(data.medias)) {
    return m.reply(JSON.stringify(data, null, 2))
  }

  for (const media of data.medias) {
    try {
      const parsed = new URL(
        media.url.startsWith('http')
          ? media.url
          : `https://capdownloader.com${media.url}`
      )

      let originalUrl = parsed.searchParams.get('url')

      if (originalUrl) {
        try {
          originalUrl = decodeURIComponent(originalUrl)
        } catch {}
      }

      media.url = originalUrl || media.url
    } catch {}
  }

  m.reply(JSON.stringify(data, null, 2))
} catch (e) {
  let error = e.message

  if (e.response?.data) {
    error = typeof e.response.data === 'string'
      ? e.response.data
      : JSON.stringify(e.response.data, null, 2)
  }

  m.reply(`❌ Error:\n${error}`)
}