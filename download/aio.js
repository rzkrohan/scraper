/*
# Name : Allinone(aio) downloader 
# Type : CJS
# Url : https://www.videodownloadertools.com
# Snippet : https://snippet.zellrayy.com/pg4UsXJf65
# Source : https://whatsapp.com/channel/0029VbDWBmtA89MamPba8q3f
*/

const axios = require('axios')
const FormData = require('form-data')

;(async () => {
  try {
    const baseURL = 'https://www.videodownloadertools.com'
    const url = 'https://vt.tiktok.com/ZSbEuPCL8'

    const client = axios.create({
      baseURL,
      timeout: 60000,
      headers: {
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
        accept: '*/*'
      }
    })

    const page = await client.get('/')

    let cookies = []

    if (page.headers['set-cookie']) {
      cookies = page.headers['set-cookie'].map(cookie => cookie.split(';')[0])
    }

    const form = new FormData()
    form.append('url', url)

    const { data } = await client.post('/fetch_api.php', form, {
      headers: {
        ...form.getHeaders(),
        origin: baseURL,
        referer: `${baseURL}/`,
        cookie: cookies.join('; ')
      }
    })

    await m.reply(
      typeof data === 'string'
        ? data
        : JSON.stringify(data, null, 2)
    )
  } catch (error) {
    await m.reply(
      `Error: ${error.response?.status || error.message}\n${
        typeof error.response?.data === 'string'
          ? error.response.data
          : JSON.stringify(error.response?.data || {})
      }`
    )
  }
})()