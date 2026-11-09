/*
# Name : Instagram Downloader (Support Story Video/Photo Carousel)
# Type : CJS
# Url : https://savefromins.com
# Snippet : https://snippet.zellrayy.com/NRTkgw4sVj
# Source : https://whatsapp.com/channel/0029VbDWBmtA89MamPba8q3f
*/

 const axios = require('axios')

const url = 'https://www.instagram.com/reel/Dd9zvW_tyEg/?stkn=cThkdzhyMGQ1OW93'

async function main() {
    try {
        const res = await axios.post(
            'https://api.savefromins.com/api/contentsite_api/media/parse',
            new URLSearchParams({
                auth: '20250901majwlqo',
                domain: 'api-ak.savefromins.com',
                origin: 'source',
                link: url
            }).toString(),
            {
                headers: {
                    accept: '*/*',
                    'content-type': 'application/x-www-form-urlencoded',
                    origin: 'https://savefromins.com',
                    referer: 'https://savefromins.com/',
                    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
                },
                timeout: 30000
            }
        )

        m.reply(JSON.stringify(res.data, null, 2))
    } catch (e) {
        m.reply(
            `❌ Error: ${
                e.response?.data
                    ? typeof e.response.data === 'string'
                        ? e.response.data
                        : JSON.stringify(e.response.data)
                    : e.message
            }`
        )
    }
}

main()