/*
# Scrape : Facebook Downloader
# Type : CJS
# Url : https://fget.io
# Snippet : https://snippet.zellrayy.com/ENqXm4QXZ6
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/
const axios = require('axios')
const cheerio = require('cheerio')

async function fget(url) {
    const endpoint = 'https://fget.io/process'

    const body = new URLSearchParams({
        id: url,
        locale: 'id'
    })

    const { data: html } = await axios.post(
        endpoint,
        body.toString(),
        {
            headers: {
                'HX-Request': 'true',
                'HX-Trigger': 'form',
                'HX-Target': 'target',
                'HX-Current-URL': 'https://fget.io/id',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': '*/*',
                'Origin': 'https://fget.io',
                'Referer': 'https://fget.io/id'
            },
            timeout: 30000
        }
    )

    const $ = cheerio.load(html)

    const result = {
        status: true,
        title: $('.result-title').first().text().trim() || null,
        thumbnail: $('.result-thumbnail img').attr('src') || null,
        video: [],
        audio: null
    }

    // Semua hasil download
    $('a.download-result').each((_, el) => {
        const a = $(el)
        const href = a.attr('href')
        const download = a.attr('download')
        const text = a.find('span').text().trim()

        if (!href) return

        const quality = a
            .closest('div.flex.items-center')
            .find('.text-sm')
            .first()
            .text()
            .trim()

        const type = a.hasClass('hd')
            ? 'hd'
            : a.hasClass('sd')
                ? 'sd'
                : a.hasClass('mp3')
                    ? 'mp3'
                    : 'unknown'

        const item = {
            type,
            quality: quality || null,
            url: href,
            filename: download || null
        }

        if (type === 'mp3') {
            result.audio = item
        } else {
            result.video.push(item)
        }
    })

    return result
}

// Test
;(async () => {
    try {
        const url = 'https://www.facebook.com/share/r/184NbDt7Lw/'

        const result = await fget(url)

        console.log(JSON.stringify(result, null, 2))
    } catch (err) {
        console.error(
            err.response?.data ||
            err.message
        )
    }
})()

module.exports = fget