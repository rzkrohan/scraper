/*
# Name : Transkripsi Audio/Video to text
# Type : CJS
# Url : https://uniscribe.co
# Snippet : https://snippet.zellrayy.com/5emfqKVZ2A
# Source : https://whatsapp.com/channel/0029VbDWBmtA89MamPba8q3f
*/

const axios = require('axios')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const SUPABASE_URL = 'https://bgcrcrsosqswpseimvvx.supabase.co'

// KALO INI EXPIRED, AMBIL SENDIRI AJA PAKE DEVTOOLS DI WEB https://uniscribe.co
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnY3JjcnNvc3Fzd3BzZWltdnZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg2NTcwOTgsImV4cCI6MjA0NDIzMzA5OH0.VH_PR47VlkvE5kDZv8Ch6H-zUGDr4mSZ9Wr5KvQ9ixc'

const API = 'https://api.uniscribe.co'

const UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'

const BASE_HEADERS = {
  'User-Agent': UA,
  Origin: 'https://www.uniscribe.co',
  Referer: 'https://www.uniscribe.co/',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
}

const MIME = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
  ogg: 'audio/ogg',
  opus: 'audio/ogg',
  webm: 'audio/webm',
  mp4: 'video/mp4'
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

async function anonymousSignup() {
  const res = await axios.post(
    `${SUPABASE_URL}/auth/v1/signup`,
    {
      data: {},
      gotrue_meta_security: {}
    },
    {
      headers: {
        ...BASE_HEADERS,
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
        'Content-Type': 'application/json;charset=UTF-8',
        'x-client-info': 'supabase-js-web/2.45.4',
        'x-supabase-api-version': '2024-01-01'
      },
      timeout: 120000
    }
  )

  return res.data?.access_token || null
}

async function downloadAudio() {
  const q = m.quoted

  if (!q) {
    await m.reply('❌ Reply audio yang mau ditranskrip.')
    return null
  }

  const type = q.mtype || ''
  const msg = q.msg || {}

  if (!['audioMessage', 'documentMessage'].includes(type)) {
    await m.reply('❌ Yang direply harus berupa audio.')
    return null
  }

  let ext = 'mp3'

  if (type === 'audioMessage') {
    const mime = String(msg.mimetype || '').toLowerCase()

    if (mime.includes('ogg')) ext = 'ogg'
    else if (mime.includes('opus')) ext = 'opus'
    else if (mime.includes('wav')) ext = 'wav'
    else if (mime.includes('mp4')) ext = 'm4a'
    else if (mime.includes('webm')) ext = 'webm'
    else if (mime.includes('mpeg')) ext = 'mp3'
  } else {
    ext = String(
      msg.fileName?.split('.').pop() || 'mp3'
    ).toLowerCase()

    if (!MIME[ext]) ext = 'mp3'
  }

  const buffer = await q.download()

  if (!buffer?.length) {
    await m.reply('❌ Gagal mengambil file audio.')
    return null
  }

  const file = path.join(
    process.cwd(),
    `uniscribe-${Date.now()}.${ext}`
  )

  fs.writeFileSync(file, buffer)

  return {
    file,
    buffer,
    ext,
    mime: MIME[ext] || msg.mimetype || 'application/octet-stream',
    seconds: Number(msg.seconds || 0)
  }
}

function getDuration(file, seconds = 0) {
  if (Number(seconds) > 0) {
    return Number(seconds)
  }

  try {
    const out = execSync(
      `ffprobe -v error -show_entries format=duration -of csv=p=0 "${file}"`,
      {
        stdio: ['ignore', 'pipe', 'ignore']
      }
    )

    const duration = parseFloat(
      out.toString().trim()
    )

    return Number.isFinite(duration)
      ? duration
      : 0
  } catch {
    return 0
  }
}

async function transcribe(file) {
  const lang = 'id'

  const duration = getDuration(
    file.file,
    file.seconds
  )

  const md5 = crypto
    .createHash('md5')
    .update(file.buffer)
    .digest('base64')

  const token = await anonymousSignup()

  if (!token) {
    return {
      error: 'Token anonim UniScribe tidak didapatkan.'
    }
  }

  const api = axios.create({
    baseURL: API,
    headers: {
      ...BASE_HEADERS,
      Authorization: `Bearer ${token}`,
      Accept: 'application/json, text/plain, */*'
    },
    timeout: 120000
  })

  await api.get('/user/limits')

  await api
    .get('/upload/provider-policy')
    .catch(() => null)

  const signed = await api.post(
    '/upload/generate-signed-url',
    {
      filename: path.basename(file.file),
      fileType: file.ext,
      fileSize: file.buffer.length,
      contentMd5Base64: md5,
      duration,
      forceUpload: true,
      languageCode: lang,
      transcriptionType: 'transcript',
      enableSpeakerDiarization: false,
      enableGlossary: false,
      providerHint: 'r2',
      premiumModelEnabled: false
    }
  )

  const data =
    signed.data?.data ||
    signed.data ||
    {}

  const uploadUrl =
    data.preSignedUrl ||
    data.signedUrl ||
    data.uploadUrl ||
    data.url

  const id =
    data.transcriptionFileId ||
    data.transcriptionId ||
    data.id

  if (!uploadUrl || !id) {
    return {
      error: 'Signed URL atau ID tidak ditemukan.',
      data
    }
  }

  await axios.put(
    uploadUrl,
    file.buffer,
    {
      headers: {
        'Content-Type': file.mime,
        'Content-Length': file.buffer.length
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 120000
    }
  )

  await api.patch(
    `/transcriptions/${id}`,
    {
      summaryTemplate: 'none',
      summaryLanguageCode: lang
    }
  )

  await api.post(
    '/upload/complete',
    {
      transcriptionFileId: id
    }
  )

  await api.post(
    '/tasks/transcription',
    {
      transcriptionFileId: id
    }
  )

  for (let i = 0; i < 90; i++) {
    await sleep(4000)

    const detail = await api.get(
      `/transcriptions/${id}`
    )

    const d =
      detail.data?.data ||
      detail.data ||
      {}

    const status = String(
      d.status ||
      d.state ||
      ''
    ).toLowerCase()

    if (
      [
        'completed',
        'complete',
        'done',
        'success',
        'finished'
      ].includes(status)
    ) {
      return d
    }

    if (
      [
        'failed',
        'error',
        'cancelled',
        'canceled'
      ].includes(status)
    ) {
      return {
        error: 'Transkripsi gagal.',
        data: d
      }
    }
  }

  return {
    error: 'Timeout menunggu hasil transkripsi.',
    id
  }
}

let temp = null

try {
  if (!m.quoted) {
    await m.reply('❌ Reply audio yang mau ditranskrip.')
  } else {
    await m.reply('⏱️ Mengambil audio...')

    temp = await downloadAudio()

    if (temp) {
      await m.reply(
        '⏱️ Audio berhasil diambil.\n' +
        '🌐 Bahasa: Indonesia (id)\n' +
        '📤 Mengirim ke UniScribe...'
      )

      const result = await transcribe(temp)

      if (result?.error) {
        let detail = ''

        if (result.data) {
          detail =
            '\n\n' +
            JSON.stringify(
              result.data,
              null,
              2
            )
        }

        await m.reply(
          `❌ ${result.error}${detail}`
        )
      } else {
        const text =
          result.transcript ||
          result.text ||
          result.transcription ||
          result.content ||
          result.result ||
          result.data?.transcript ||
          result.data?.text ||
          result.data?.transcription

        if (
          typeof text === 'string' &&
          text.trim()
        ) {
          await m.reply(
            `🎙️ *Hasil Transkripsi*\n\n${text.trim()}`
          )
        } else {
          await m.reply(
            '🎙️ *Hasil UniScribe*\n\n' +
            JSON.stringify(
              result,
              null,
              2
            )
          )
        }
      }
    }
  }
} catch (e) {
  let error = e?.message || String(e)

  if (e?.response) {
    error =
      `${e.response.status} ` +
      (
        typeof e.response.data === 'string'
          ? e.response.data
          : JSON.stringify(
              e.response.data,
              null,
              2
            )
      )
  }

  await m.reply(`❌ Error:\n${error}`)
} finally {
  if (temp?.file) {
    try {
      if (fs.existsSync(temp.file)) {
        fs.unlinkSync(temp.file)
      }
    } catch {}
  }
}

null