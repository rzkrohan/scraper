/*
# Name : Terabox Downloader
# Type : CJS
# Url : https://teradownloader.pro
# Snippet : https://snippet.zellrayy.com/v2bFacFqDA
# Source : https://whatsapp.com/channel/0029VbDWBmtA89MamPba8q3f
*/

const axios = require('axios')

async function terabox(url) {
    try {
        const { data } = await axios.post(
            'https://apiwala.teradownloader.pro/web/api/terabox',
            {
                link: url,
                dir_path: '',
                page: 1
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )

        return data
    } catch (e) {
        return {
            success: false,
            error: e.response?.data || e.message
        }
    }
}

try {
    const data = await terabox('https://www.terabox.app/wap/share/filelist?surl=sab4x_EjggLREkDSC616Rw')
    m.reply(JSON.stringify(data, null, 2))
} catch (e) {
    m.reply(`Error: ${e.message}`)
}