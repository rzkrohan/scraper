/*
# Name : Screenshot website
# Type : CJS
# Url : https://microlink.io
# Snippet : https://snippet.zellrayy.com/rAxsySs4pD
# Source : https://whatsapp.com/channel/0029VbDWBmtA89MamPba8q3f
*/
const axios = require('axios');

async function websiteScreenshot(url) {
    const devices = {
        desktop: {
            width: 1920,
            height: 1080
        },
        tablet: {
            width: 768,
            height: 1024
        },
        mobile: {
            width: 393,
            height: 852
        }
    };

    const result = {};

    for (const [device, viewport] of Object.entries(devices)) {
        try {
            const response = await axios.get('https://api.microlink.io/', {
                params: {
                    url,
                    meta: false,
                    'screenshot.type': 'png',
                    'screenshot.fullPage': false,
                    'viewport.width': viewport.width,
                    'viewport.height': viewport.height,
                    adblock: true,
                    force: false
                },
                headers: {
                    'User-Agent': device === 'mobile'
                        ? 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36'
                        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36',
                    'Referer': 'https://microlink.io/tools/website-screenshot'
                },
                timeout: 60000
            });

            const data = response.data;

            if (data.status !== 'success' || !data.data?.screenshot?.url) {
                throw new Error('Screenshot gagal dibuat');
            }

            result[device] = {
                url: data.data.screenshot.url,
                type: data.data.screenshot.type,
                width: data.data.screenshot.width,
                height: data.data.screenshot.height,
                size: data.data.screenshot.size,
                size_pretty: data.data.screenshot.size_pretty
            };

        } catch (error) {
            result[device] = {
                error: error.response?.data || error.message
            };
        }
    }

    return {
        status: 'success',
        target: url,
        result
    };
}

const hasil = await websiteScreenshot('https://whatsapp.com');

await m.reply(JSON.stringify(hasil, null, 2));