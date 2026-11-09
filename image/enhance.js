/*
# Name : Enhanced Photo
# Type : CJS
# Url : https://imgupscaler.ai
# Snippet : https://snippet.zellrayy.com/XbkLywwgjd
# Source : https://whatsapp.com/channel/0029VbDWBmtA89MamPba8q3f
*/

const axios = require('axios')
const FormData = require('form-data')
const crypto = require('crypto')

async function imgUpscaler(url) {
  try {
    const image = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    })

    const productSerial = crypto.randomUUID()

    const form = new FormData()

    form.append('original_image_file', Buffer.from(image.data), {
      filename: `${crypto.randomBytes(16).toString('hex')}.jpg`,
      contentType: image.headers['content-type'] || 'image/jpeg'
    })

    form.append('scene', 'normal')
    form.append('output_format', 'jpg')

    const headers = {
      ...form.getHeaders(),
      accept: '*/*',
      'product-code': 'Imgupscaler',
      'product-serial': productSerial,
      'router-key': 'iu_home_image_enhancer_v1',
      timezone: 'Asia/Jakarta',
      origin: 'https://imgupscaler.ai',
      referer: 'https://imgupscaler.ai/',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 12; K) AppleWebKit/537.36 Chrome/139.0.0.0 Mobile Safari/537.36'
    }

    const create = await axios.post(
      'https://api-v2.imgupscaler.ai/api/runtime/jobs/create-job',
      form,
      {
        headers,
        timeout: 60000
      }
    )

    const jobId = create.data?.result?.job_id

    if (!jobId) {
      await m.reply(`❌ Job ID tidak ditemukan:\n${JSON.stringify(create.data, null, 2)}`)
      return
    }

    await m.reply(`⏳ Job dibuat:\n${jobId}`)

    for (let i = 0; i < 30; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const check = await axios.get(
        `https://api-v2.imgupscaler.ai/api/runtime/jobs/get-job/${jobId}`,
        {
          headers: {
            accept: '*/*',
            'product-serial': productSerial,
            'router-key': 'iu_home_image_enhancer_v1',
            timezone: 'Asia/Jakarta',
            origin: 'https://imgupscaler.ai',
            referer: 'https://imgupscaler.ai/',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 12; K) AppleWebKit/537.36 Chrome/139.0.0.0 Mobile Safari/537.36'
          },
          timeout: 30000
        }
      )

      const data = check.data

      const output =
        data?.result?.output_image_url ||
        data?.result?.outputUrl ||
        data?.result?.output_url ||
        data?.data?.output_image_url ||
        data?.data?.outputUrl ||
        data?.data?.output_url ||
        data?.output_image_url ||
        data?.outputUrl ||
        data?.output_url

      if (output) {
        await m.reply(output)
        return output
      }

      const status =
        data?.result?.status ??
        data?.data?.status ??
        data?.status

      if (
        status === 'failed' ||
        status === 'error' ||
        status === 'FAILURE' ||
        status === 3
      ) {
        await m.reply(`❌ Upscale gagal:\n${JSON.stringify(data, null, 2)}`)
        return
      }
    }

    await m.reply(`⏱️ Timeout menunggu hasil upscale.\nJob ID: ${jobId}`)
  } catch (e) {
    await m.reply(`❌ Error:\n${e.response?.data ? JSON.stringify(e.response.data, null, 2) : e.message}`)
  }
}

await imgUpscaler('https://cdn.zass.in/NTMXjB49dZ.png')