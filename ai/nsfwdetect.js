/*
# Name : Allinone(aio) downloader 
# Type : CJS
# Url : https://www.nyckel.com
# Snippet : https://snippet.zellrayy.com/8EXJggFsVD
# Source : https://whatsapp.com/channel/0029VbDWBmtA89MamPba8q3f
*/

(async () => {
  try {
    const axios = require('axios')
    const FormData = require('form-data')

    const url = 'https://cdn.zass.in/Jiv7NA1Hno.jpg'
    const pageUrl = 'https://www.nyckel.com/pretrained-classifiers/nsfw-identifier/'
    const fallbackId = 'o2f0jzcdyut2qxhu'

    const idRegex = /\/v1\/functions\/([a-zA-Z0-9_-]+)\/invoke/g

    const extractId = source => {
      const matches = [...String(source).matchAll(idRegex)]
        .map(x => x[1])
        .filter(id => id && id !== 'YOUR_FUNCTION_ID')

      return matches[0] || null
    }

    const { data: html } = await axios.get(pageUrl, {
      timeout: 30000
    })

    let functionId = extractId(html)

    if (!functionId) {
      const scripts = [
        ...String(html).matchAll(
          /<script[^>]+src=["']([^"']+)["']/gi
        )
      ].map(x => new URL(x[1], pageUrl).href)

      const results = await Promise.allSettled(
        scripts.map(src =>
          axios.get(src, { timeout: 15000 }).then(r => r.data)
        )
      )

      for (const result of results) {
        if (result.status !== 'fulfilled') continue

        functionId = extractId(result.value)
        if (functionId) break
      }
    }

    if (!functionId) {
      functionId = fallbackId
    }

    const image = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000
    })

    const form = new FormData()

    form.append('file', Buffer.from(image.data), {
      filename: 'image.jpg',
      contentType: image.headers['content-type'] || 'image/jpeg'
    })

    const endpoint =
      `https://www.nyckel.com/v1/functions/${functionId}/invoke`

    let response

    try {
      response = await axios.post(endpoint, form, {
        headers: {
          ...form.getHeaders(),
          Accept: 'application/json, text/javascript, */*; q=0.01',
          Origin: 'https://www.nyckel.com',
          Referer: pageUrl,
          'X-Requested-With': 'XMLHttpRequest'
        },
        timeout: 60000
      })
    } catch (e) {
      if (
        functionId !== fallbackId &&
        JSON.stringify(e.response?.data || '').includes('Invalid id')
      ) {
        return m.reply(
          'ID yang ditemukan tidak valid: ' + functionId +
          '\nID baru belum berhasil ditemukan. Perlu cek request terbaru dari halaman Nyckel.'
        )
      }

      throw e
    }

    return m.reply(JSON.stringify(response.data, null, 2)
    )
  } catch (e) {
    return m.reply(
      'Error:\n' +
      JSON.stringify(e.response?.data || e.message)
    )
  }
})()