/*
# Name : Edit Image Ai
# Type : CJS
# Url : https://unwatermark.ai
# Snippet : https://snippet.zellrayy.com/BSC6WHYE8S
# Source : https://whatsapp.com/channel/0029VbDWBmtA89MamPba8q3f
*/
const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const path = require('path')

async function main() {
  let temp = null

  try {
    let target = null

    if (m.quoted) {
      if (
        m.quoted.mtype === 'imageMessage' ||
        m.quoted.message?.imageMessage
      ) {
        target = m.quoted
      }
    }

    if (!target && m.mtype === 'imageMessage') {
      target = m
    }

    if (!target) {
      return m.reply('❌ Reply gambar terlebih dahulu.')
    }

    const media = await target.download()

    if (!media) {
      return m.reply('❌ Gagal mengambil gambar.')
    }

    temp = path.join(
      process.cwd(),
      `unwatermark_${Date.now()}.jpg`
    )

    fs.writeFileSync(temp, media)

    const proses = await m.reply(
      '⏳ Memproses gambar...\n\nStatus: Menyiapkan gambar...'
    )

    const edit = async (text) => {
      try {
        await conn.relayMessage(
          m.chat,
          {
            protocolMessage: {
              key: proses.key,
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

    await edit(
      '⏳ Memproses gambar...\n\nStatus: Mengupload gambar...'
    )

    const form = new FormData()

    form.append(
      'target_images',
      fs.createReadStream(temp),
      {
        filename: 'image.jpg',
        contentType: 'image/jpeg'
      }
    )

    form.append('prompt', 'remove the text')
    form.append('ratio', 'match_input_image')

    const create = await axios.post(
      'https://api.unwatermark.ai/api/web/v1/photo-editor-flux-kontext/create-job',
      form,
      {
        headers: {
          ...form.getHeaders(),
          Accept: 'application/json, text/plain, */*',
          'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
          Origin: 'https://unwatermark.ai',
          Referer: 'https://unwatermark.ai/',
          'Product-Code': '067003',
          'Product-Serial': 'ukva7y',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36'
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 120000
      }
    )

    const createResult = create.data
    const jobId = createResult?.result?.job_id

    if (!jobId) {
      return edit(
        `❌ Gagal membuat job.\n\n${JSON.stringify(createResult, null, 2)}`
      )
    }

    await edit(
      `⏳ Memproses gambar...\n\nStatus: Job dibuat\nJob ID: ${jobId}\n\nMenunggu hasil...`
    )

    let result = null

    for (let i = 1; i <= 90; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const response = await axios.get(
        `https://api.unwatermark.ai/api/web/v1/photo-editor-flux-kontext/get-job/${jobId}`,
        {
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            Origin: 'https://unwatermark.ai',
            Referer: 'https://unwatermark.ai/',
            'Product-Code': '067003',
            'Product-Serial': 'ukva7y',
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36'
          },
          timeout: 30000
        }
      )

      result = response.data

      const job = result?.result

      const status = job?.status

      if (
        status === 1 ||
        status === 2 ||
        status === 3 ||
        status === 4 ||
        status === 'success' ||
        status === 'completed' ||
        status === 'complete' ||
        status === 'finished' ||
        status === 'done'
      ) {
        break
      }

      if (
        status === -1 ||
        status === 'failed' ||
        status === 'error' ||
        status === 'cancelled' ||
        status === 'canceled'
      ) {
        break
      }

      await edit(
        `⏳ Memproses gambar...\n\nStatus: Processing\nPercobaan: ${i}/90\nJob ID: ${jobId}`
      )
    }

    await edit('✅ Proses selesai.\n\nMengirim JSON hasil...')

    await m.reply(
      JSON.stringify(result, null, 2)
    )

  } catch (e) {
    await m.reply(
      `❌ Error: ${e.response?.data?.message || e.response?.data?.error || e.message}`
    )
  } finally {
    if (temp) {
      try {
        if (fs.existsSync(temp)) {
          fs.unlinkSync(temp)
        }
      } catch {}
    }
  }
}

main()