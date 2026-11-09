/*
# Scrape : TikTok Search Video
# Type : CJS
# Url : https://www.revid.ai
# Snippet : https://snippet.zellrayy.com/tQ2eABj86E
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/

const axios = require('axios')

async function tiktokSearch(keywords = 'cat', options = {}) {
    const {
        sort = '',
        minNbChar = 10,
        lang = 'en',
        createTimeStart = 1742259708,
        createTimeEnd = 1789563708
    } = options

    const payload = {
        keywords,
        filtersFast: [
            `nbChar > ${minNbChar}`,
            `lang = '${lang}'`,
            `createTime >= ${createTimeStart} AND createTime <= ${createTimeEnd}`
        ],
        extraParams: {
            sort
        }
    }

    try {
        const { data } = await axios.post(
            'https://www.revid.ai/api/tiktok-search',
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 30000
            }
        )

        return data
    } catch (error) {
        if (error.response) {
            throw new Error(
                `Revid API ${error.response.status}: ${
                    typeof error.response.data === 'string'
                        ? error.response.data
                        : JSON.stringify(error.response.data)
                }`
            )
        }

        throw error
    }
}

module.exports = tiktokSearch