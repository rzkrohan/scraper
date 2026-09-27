/*
# Name : Instagram Download (video, image carousel)
# Type : CJS
# Url : https://clipssaver.com
# Snippet : https://snippet.zellrayy.com/kTLUERvPx2
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/
const axios = require('axios')

async function instagramScraper(url) {
    try {
        const { data } = await axios.post(
            'https://7kpgrnvomroojzq6fw5e6qkogq0zyiuv.lambda-url.eu-north-1.on.aws/api/instagram/fetch',
            { url },
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        )

        if (!data?.success || !data?.data?.success) {
            throw new Error('Gagal mengambil data Instagram')
        }

        const result = data.data

        return {
            success: true,
            resultsCount: result.resultsCount,
            postInfo: result.postInfo,
            mediaItems: result.mediaItems.map(item => ({
                type: item.type,
                url: item.url,
                thumbnail: item.thumbnail,
                dimensions: item.dimensions
            }))
        }
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || error.message
        }
    }
}

// Contoh
;(async () => {
    const result = await instagramScraper(
        'https://www.instagram.com/reel/Dby_sZEEQD1/?igsh=YmcyeTA1ZGt5MHN3'
    )

    process.stdout.write(JSON.stringify(result, null, 2))
})()