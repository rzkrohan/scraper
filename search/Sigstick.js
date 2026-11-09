/*
# Name : Sticker Telegram Search
# Type : CJS
# Url : https://www.sigstick.com
# Snippet : https://snippet.zellrayy.com/LwGwR7vP9f
# Source : https://whatsapp.com/channel/0029VbDWBmtA89MamPba8q3f
*/

const axios = require('axios')

const baseHeaders = {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
}

const axiosInstance = axios.create({
  timeout: 15000,
  headers: baseHeaders
})

async function extractBuildId(m) {
  try {
    const response = await axiosInstance.get('https://www.sigstick.com/stickers')
    const html = response.data

    const buildIdMatch = html.match(/"buildId":"([a-zA-Z0-9_-]+)"/)

    if (buildIdMatch?.[1]) return buildIdMatch[1]

    const altMatch = html.match(/data-build-id="([a-zA-Z0-9_-]+)"/)

    if (altMatch?.[1]) return altMatch[1]

    await m.reply('Build ID tidak ditemukan di halaman.')
    return null
  } catch (error) {
    await m.reply(`Error ekstrak Build ID: ${error.message}`)
    return null
  }
}

async function fetchStickers(m, keyword = 'prabowo', buildId = null) {
  try {
    if (!buildId) {
      buildId = await extractBuildId(m)
      if (!buildId) return null
    }

    const url = `https://www.sigstick.com/_next/data/${buildId}/stickers.json`

    const headers = {
      ...baseHeaders,
      'sec-ch-ua': '"Chromium";v="139", "Not;A=Brand";v="99"',
      'x-nextjs-data': '1',
      'Referer': `https://www.sigstick.com/stickers?keyword=${encodeURIComponent(keyword)}`,
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"'
    }

    const response = await axiosInstance.get(url, {
      params: {
        keyword
      },
      headers
    })

    const packs = response.data?.pageProps?.packs || []

    if (!packs.length) {
      await m.reply(`Tidak ada sticker pack untuk keyword: ${keyword}`)
      return null
    }

    let text = `Hasil pencarian: ${keyword}\n`
    text += `Total: ${packs.length}\n\n`

    for (let i = 0; i < packs.length; i++) {
      const pack = packs[i]

      text += `${i + 1}. ${pack.title || 'Tanpa Judul'}\n`
      text += `Status: ${pack.status || '-'}\n`
      text += `ID: ${pack.id || '-'}\n`
      text += `Telegram Pack: ${pack.telegramUrl || '-'}\n\n`
    }

    await m.reply(text.trim())

    return {
      status: response.status,
      packs
    }
  } catch (error) {
    let msg = `Error: ${error.message}`

    if (error.response) {
      msg += `\nStatus: ${error.response.status}`

      if (error.response.data) {
        msg += `\nData: ${JSON.stringify(error.response.data).slice(0, 3000)}`
      }
    }

    await m.reply(msg)
    return null
  }
}

;(async () => {
  try {
    await fetchStickers(m, 'prabowo')
  } catch (error) {
    await m.reply(`Script Error: ${error.message}`)
  }
})()