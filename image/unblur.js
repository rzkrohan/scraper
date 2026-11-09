/*
# Name : Unblur Image
# Type : CJS
# Url : https://unblurimage.ai/
# Snippet : https://snippet.zellrayy.com/ddU2P4XnUa
# Source : https://whatsapp.com/channel/0029VbDWBmtA89MamPba8q3f
*/
try {
    const axios = require('axios')
    const FormData = require('form-data')
    const fs = require('fs')
    const path = require('path')

    const q = m.quoted || m

    if (!/image/.test(q.mtype || '')) {
        return m.reply('❌ Reply/kirim foto terlebih dahulu.')
    }

    const edit = async (text, key) => {
        try {
            await conn.relayMessage(
                m.chat,
                {
                    protocolMessage: {
                        key,
                        type: 14,
                        editedMessage: {
                            conversation: text
                        }
                    }
                },
                {}
            )
        } catch {}
    }

    const statusMsg = await m.reply('Mengunduh gambar...')

    const media = await q.download()
    const input = `./tmp_unblur_${Date.now()}.jpg`

    fs.writeFileSync(input, media)

    try {
        await edit('Mengupload gambar...', statusMsg)

        const BASE = 'https://api.unwatermark.ai/api/web/unblurimage/v1/image-unblur-v2'

        const headers = {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
            'Origin': 'https://unblurimage.ai',
            'Referer': 'https://unblurimage.ai/',
            'Accept': '*/*',
            'product-code': '067003',
            'product-serial': 'uigbeo'
        }

        const form = new FormData()

        form.append(
            'original_image_file',
            fs.createReadStream(input),
            {
                filename: path.basename(input),
                contentType: 'image/jpeg'
            }
        )

        const upload = await axios.post(
            `${BASE}/create-job`,
            form,
            {
                headers: {
                    ...headers,
                    ...form.getHeaders()
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                timeout: 120000
            }
        )

        const uploadResult = upload.data

        const jobId =
            uploadResult?.job_id ||
            uploadResult?.jobId ||
            uploadResult?.data?.job_id ||
            uploadResult?.data?.jobId ||
            uploadResult?.result?.job_id ||
            uploadResult?.result?.jobId

        if (!jobId) {
            return edit(
                `Job ID tidak ditemukan.\n\n${JSON.stringify(uploadResult, null, 2)}`,
                statusMsg
            )
        }

        await edit(
            `Upload berhasil\n\n Job ID: ${jobId}\n Memproses...`,
            statusMsg
        )

        let result
        let imageUrl = null

        for (let i = 1; i <= 30; i++) {
            await new Promise(resolve => setTimeout(resolve, 2000))

            try {
                const response = await axios.get(
                    `${BASE}/get-job/${jobId}`,
                    {
                        headers: {
                            ...headers,
                            'Content-Type': 'application/json; charset=UTF-8'
                        },
                        timeout: 30000
                    }
                )

                result = response.data

                imageUrl =
                    result?.output_url ||
                    result?.outputUrl ||
                    result?.image_url ||
                    result?.imageUrl ||
                    result?.data?.output_url ||
                    result?.data?.outputUrl ||
                    result?.data?.image_url ||
                    result?.data?.imageUrl ||
                    result?.result?.output_url ||
                    result?.result?.outputUrl ||
                    result?.result?.image_url ||
                    result?.result?.imageUrl

                const status =
                    result?.status ||
                    result?.data?.status ||
                    result?.result?.status ||
                    'processing'

                if (imageUrl) {
                    return edit(
                        `Unblur selesai!\n\n` +
                        `Job ID: ${jobId}\n` +
                        `Status: ${status}\n\n` +
                        `${imageUrl}\n\n` +
                        `JSON:\n${JSON.stringify(result, null, 2)}`,
                        statusMsg
                    )
                }

                if (
                    ['failed', 'error', 'cancelled'].includes(
                        String(status).toLowerCase()
                    )
                ) {
                    return edit(
                        `Proses gagal\n\n` +
                        `Status: ${status}\n\n` +
                        JSON.stringify(result, null, 2),
                        statusMsg
                    )
                }

                await edit(
                    `Memproses gambar...\n\n` +
                    `Job ID: ${jobId}\n` +
                    `Status: ${status}\n` +
                    `Percobaan: ${i}/30`,
                    statusMsg
                )

            } catch (error) {
                await edit(
                    `Mengecek hasil...\n\n` +
                    `Job ID: ${jobId}\n` +
                    `Percobaan: ${i}/30`,
                    statusMsg
                )
            }
        }

        await edit(
            `Timeout menunggu hasil.\n\n` +
            `Job ID: ${jobId}\n\n` +
            `JSON:\n${JSON.stringify(result, null, 2)}`,
            statusMsg
        )

    } finally {
        try {
            if (fs.existsSync(input)) {
                fs.unlinkSync(input)
            }
        } catch {}
    }

} catch (error) {
    await m.reply(
        `❌ Error:\n${JSON.stringify(
            error.response?.data || error.message,
            null,
            2
        )}`
    )
}