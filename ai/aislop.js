/*
# Name : Scan Ai slop website
# Type : CJS
# Url : https://www.sniffslop.com
# Snippet : https://snippet.zellrayy.com/TvbyRRJjRP
# Source : https://whatsapp.com/channel/0029VbDWBmtA89MamPba8q3f
*/

const axios = require('axios')

async function scanWebsite(url) {
  try {
    const response = await axios.post(
      'https://www.sniffslop.com/api/scan',
      { url },
      {
        headers: {
          'accept': '*/*',
          'content-type': 'application/json',
          'origin': 'https://www.sniffslop.com',
          'referer': 'https://www.sniffslop.com/',
          'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
        },
        timeout: 120000
      }
    )

    return response.data
  } catch (error) {
    return {
      status: false,
      message: error.response?.data?.message ||
        error.response?.data ||
        error.message
    }
  }
}

try {
  const result = await scanWebsite('https://kyzorohan.web.id')
  m.reply(JSON.stringify(result, null, 2))
} catch (error) {
  m.reply(`Gagal scan website: ${error.message}`)
}