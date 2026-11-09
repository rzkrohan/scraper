import axios from 'axios'
import crypto from 'crypto'
import https from 'https'
import JSZip from 'jszip'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { writeFile, readFile, unlink } from 'fs/promises'
import path from 'path'
import os from 'os'
import {
  generateWAMessageFromContent,
  proto
} from '@whiskeysockets/baileys'

const exec = promisify(execFile)

const TOKEN =
  '123:ABC'

const react = async (conn, m, text) => {
  try {
    await conn.sendMessage(
      m.chat,
      {
        react: {
          text,
          key: m.key
        }
      }
    )
  } catch {}
}

const editMessage = async (
  conn,
  m,
  status,
  text
) => {
  try {
    await conn.relayMessage(
      m.chat,
      {
        protocolMessage: {
          key: status.key,
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

function toBuffer(value) {
  if (Buffer.isBuffer(value)) {
    return value
  }

  if (
    value &&
    value.type === 'Buffer' &&
    Array.isArray(value.data)
  ) {
    return Buffer.from(value.data)
  }

  if (typeof value === 'string') {
    return Buffer.from(
      value,
      'base64'
    )
  }

  return null
}

function sha256(buffer) {
  return crypto
    .createHash('sha256')
    .update(buffer)
    .digest()
}

function toB64Url(buffer) {
  return Buffer.from(buffer)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function isWebP(buffer) {
  return (
    buffer?.length >= 12 &&
    buffer.toString(
      'ascii',
      0,
      4
    ) === 'RIFF' &&
    buffer.toString(
      'ascii',
      8,
      12
    ) === 'WEBP'
  )
}

function isAnimatedWebP(buffer) {
  if (!isWebP(buffer)) {
    return false
  }

  let offset = 12

  while (
    offset <
    buffer.length - 8
  ) {
    const chunk =
      buffer.toString(
        'ascii',
        offset,
        offset + 4
      )

    const size =
      buffer.readUInt32LE(
        offset + 4
      )

    if (
      chunk === 'VP8X' &&
      (buffer[offset + 8] & 0x02)
    ) {
      return true
    }

    if (
      chunk === 'ANIM' ||
      chunk === 'ANMF'
    ) {
      return true
    }

    offset +=
      8 +
      size +
      (size % 2)
  }

  return false
}

async function getSharp() {
  const mod =
    await import('sharp')
      .catch(() => null)

  return mod?.default || null
}

async function makeTrayWebp(buffer) {
  const sharp =
    await getSharp()

  if (!sharp) {
    return null
  }

  return sharp(buffer)
    .resize(252, 252, {
      fit: 'cover'
    })
    .webp()
    .toBuffer()
}

async function makeBlankTrayWebp() {
  const sharp =
    await getSharp()

  if (!sharp) {
    return null
  }

  return sharp({
    create: {
      width: 252,
      height: 252,
      channels: 4,
      background: {
        r: 0,
        g: 0,
        b: 0,
        alpha: 0
      }
    }
  })
    .webp()
    .toBuffer()
}

async function makeThumbnailJpeg(
  buffer
) {
  const sharp =
    await getSharp()

  if (!sharp) {
    return null
  }

  return sharp(buffer)
    .resize(252, 252, {
      fit: 'cover'
    })
    .jpeg()
    .toBuffer()
}

async function webmToWebp(
  buffer
) {
  const id =
    `${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}`

  const input =
    path.join(
      os.tmpdir(),
      `${id}.webm`
    )

  const output =
    path.join(
      os.tmpdir(),
      `${id}.webp`
    )

  try {
    await writeFile(
      input,
      buffer
    )

    await exec(
      'ffmpeg',
      [
        '-y',
        '-i',
        input,
        '-vf',
        'scale=512:512:force_original_aspect_ratio=decrease,fps=15',
        '-c:v',
        'libwebp',
        '-q:v',
        '70',
        '-loop',
        '0',
        '-an',
        output
      ]
    )

    return await readFile(
      output
    )
  } catch {
    return null
  } finally {
    await unlink(input)
      .catch(() => {})

    await unlink(output)
      .catch(() => {})
  }
}

async function uploadToServer(
  conn,
  buffer,
  {
    hkdf,
    mediaPath,
    mediaKey = crypto.randomBytes(32)
  }
) {
  try {
    const expanded =
      Buffer.from(
        crypto.hkdfSync(
          'sha256',
          mediaKey,
          Buffer.alloc(32),
          Buffer.from(hkdf),
          112
        )
      )

    const iv =
      expanded.subarray(
        0,
        16
      )

    const cipherKey =
      expanded.subarray(
        16,
        48
      )

    const macKey =
      expanded.subarray(
        48,
        80
      )

    const cipher =
      crypto.createCipheriv(
        'aes-256-cbc',
        cipherKey,
        iv
      )

    const encrypted =
      Buffer.concat([
        cipher.update(buffer),
        cipher.final()
      ])

    const mac =
      crypto
        .createHmac(
          'sha256',
          macKey
        )
        .update(iv)
        .update(encrypted)
        .digest()
        .subarray(0, 10)

    const encBuffer =
      Buffer.concat([
        encrypted,
        mac
      ])

    const fileSha256 =
      sha256(buffer)

    const fileEncSha256 =
      sha256(encBuffer)

    const iq =
      await conn.query({
        tag: 'iq',
        attrs: {
          id:
            conn.generateMessageTag?.() ||
            Date.now().toString(),
          to: 's.whatsapp.net',
          type: 'set',
          xmlns: 'w:m'
        },
        content: [
          {
            tag: 'media_conn',
            attrs: {}
          }
        ]
      })

    const mediaConn =
      iq.content?.find(
        x =>
          x.tag ===
          'media_conn'
      )

    if (!mediaConn) {
      return null
    }

    const auth =
      mediaConn.attrs?.auth

    if (!auth) {
      return null
    }

    const hosts =
      (mediaConn.content || [])
        .filter(
          x =>
            x.tag === 'host'
        )
        .map(
          x =>
            x.attrs?.hostname
        )
        .filter(Boolean)

    if (!hosts.length) {
      return null
    }

    const token =
      encodeURIComponent(
        fileEncSha256
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/g, '')
      )

    for (
      const host of hosts
    ) {
      try {
        const result =
          await new Promise(
            resolve => {
              const url =
                new URL(
                  `https://${host}${mediaPath}/${token}?auth=${encodeURIComponent(auth)}&token=${token}`
                )

              const req =
                https.request(
                  {
                    hostname:
                      url.hostname,
                    port: 443,
                    path:
                      url.pathname +
                      url.search,
                    method: 'POST',
                    headers: {
                      Origin:
                        'https://web.whatsapp.com',
                      Referer:
                        'https://web.whatsapp.com/',
                      'Content-Type':
                        'application/octet-stream',
                      'Content-Length':
                        encBuffer.length
                    }
                  },
                  res => {
                    let body = ''

                    res.on(
                      'data',
                      chunk => {
                        body += chunk
                      }
                    )

                    res.on(
                      'end',
                      () => {
                        if (
                          res.statusCode <
                            200 ||
                          res.statusCode >=
                            300
                        ) {
                          return resolve(
                            null
                          )
                        }

                        try {
                          resolve(
                            JSON.parse(
                              body
                            )
                          )
                        } catch {
                          resolve(
                            null
                          )
                        }
                      }
                    )
                  }
                )

              req.on(
                'error',
                () => resolve(null)
              )

              req.write(
                encBuffer
              )

              req.end()
            }
          )

        if (!result) {
          continue
        }

        const directPath =
          result.direct_path ||
          result.directPath ||
          result.path ||
          result.url

        if (!directPath) {
          continue
        }

        return {
          mediaKey,
          fileLength:
            buffer.length,
          fileSha256,
          fileEncSha256,
          directPath,
          ...result
        }
      } catch {}
    }

    return null
  } catch {
    return null
  }
}

async function getStickerPack(
  name
) {
  try {
    const { data } =
      await axios.get(
        `https://api.telegram.org/bot${TOKEN}/getStickerSet`,
        {
          params: {
            name
          },
          timeout: 15000
        }
      )

    if (!data?.ok) {
      return null
    }

    return data.result
  } catch {
    return null
  }
}

async function downloadSticker(
  fileId
) {
  try {
    const { data: file } =
      await axios.get(
        `https://api.telegram.org/bot${TOKEN}/getFile`,
        {
          params: {
            file_id: fileId
          },
          timeout: 15000
        }
      )

    if (!file?.ok) {
      return null
    }

    const filePath =
      file.result?.file_path

    if (!filePath) {
      return null
    }

    const { data } =
      await axios.get(
        `https://api.telegram.org/file/bot${TOKEN}/${filePath}`,
        {
          responseType:
            'arraybuffer',
          timeout: 30000
        }
      )

    return {
      buffer:
        Buffer.from(data),
      filePath
    }
  } catch {
    return null
  }
}

function extractTelegramPackName(
  pack
) {
  const values = [
    pack?.telegram,
    pack?.telegramUrl,
    pack?.telegram_url,
    pack?.telegramLink,
    pack?.telegram_link,
    pack?.url,
    pack?.link
  ]

  for (
    const value of values
  ) {
    if (!value) {
      continue
    }

    const match =
      String(value).match(
        /(?:https?:\/\/)?t\.me\/addstickers\/([A-Za-z0-9_]+)/i
      )

    if (match?.[1]) {
      return match[1]
    }
  }

  return null
}

async function getSigstickBuildId() {
  try {
    const { data: html } =
      await axios.get(
        'https://www.sigstick.com/stickers',
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          },
          timeout: 15000
        }
      )

    const match =
      html.match(
        /"buildId":"([a-zA-Z0-9_-]+)"/
      ) ||
      html.match(
        /data-build-id="([a-zA-Z0-9_-]+)"/
      )

    return match?.[1] || null
  } catch {
    return null
  }
}

async function searchStickerPacks(
  query
) {
  try {
    const buildId =
      await getSigstickBuildId()

    if (!buildId) {
      return []
    }

    const { data } =
      await axios.get(
        `https://www.sigstick.com/_next/data/${buildId}/stickers.json`,
        {
          params: {
            keyword: query
          },
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
            'x-nextjs-data': '1',
            Referer:
              `https://www.sigstick.com/stickers?keyword=${encodeURIComponent(query)}`,
            'sec-ch-ua':
              '"Chromium";v="139", "Not;A=Brand";v="99"',
            'sec-ch-ua-mobile':
              '?1',
            'sec-ch-ua-platform':
              '"Android"',
            Accept: '*/*'
          },
          timeout: 15000
        }
      )

    const packs =
      data?.pageProps?.packs ||
      []

    if (!Array.isArray(packs)) {
      return []
    }

    const results = []
    const seen = new Set()

    for (
      const item of packs
    ) {
      const telegramName =
        extractTelegramPackName(
          item
        )

      if (!telegramName) {
        continue
      }

      if (
        seen.has(
          telegramName
        )
      ) {
        continue
      }

      seen.add(
        telegramName
      )

      const telegramPack =
        await getStickerPack(
          telegramName
        )

      if (!telegramPack) {
        continue
      }

      results.push({
        title:
          telegramPack.title ||
          item.title ||
          telegramName,

        name:
          telegramName,

        url:
          `https://t.me/addstickers/${telegramName}`,

        count:
          telegramPack.stickers
            ?.length || 0
      })

      if (
        results.length >= 20
      ) {
        break
      }
    }

    return results
  } catch {
    return []
  }
}

async function sendStickerSearchList(
  conn,
  m,
  query,
  packs
) {
  try {
    const rows =
      packs.map(
        (pack, index) => ({
          title:
            `${index + 1}. ${String(pack.title).slice(0, 55)}`,

          description:
            `${pack.count} sticker • Telegram`,

          id:
            `.stickerpack_get ${pack.url}`
        })
      )

    const message =
      generateWAMessageFromContent(
        m.chat,
        {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2
              },

              interactiveMessage:
                proto.Message.InteractiveMessage.create(
                  {
                    body:
                      proto.Message.InteractiveMessage.Body.create(
                        {
                          text:
                            `🔎 Hasil Sticker Search\n\n` +
                            `Keyword: ${query}\n` +
                            `Ditemukan: ${packs.length} pack\n\n` +
                            `Pilih sticker pack yang ingin diambil.`
                        }
                      ),

                    footer:
                      proto.Message.InteractiveMessage.Footer.create(
                        {
                          text:
                            'Sticker Search'
                        }
                      ),

                    header:
                      proto.Message.InteractiveMessage.Header.create(
                        {
                          title:
                            'Telegram Sticker Pack',
                          subtitle:
                            'Pilih pack',
                          hasMediaAttachment:
                            false
                        }
                      ),

                    nativeFlowMessage:
                      proto.Message.InteractiveMessage.NativeFlowMessage.create(
                        {
                          buttons: [
                            {
                              name:
                                'single_select',

                              buttonParamsJson:
                                JSON.stringify(
                                  {
                                    title:
                                      'Pilih Sticker Pack',

                                    sections: [
                                      {
                                        title:
                                          `Hasil "${query}"`,

                                        rows
                                      }
                                    ]
                                  }
                                )
                            }
                          ]
                        }
                      )
                  }
                )
            }
          }
        },
        {
          quoted: m,
          userJid:
            conn.user?.id
        }
      )

    await conn.relayMessage(
      m.chat,
      message.message,
      {
        messageId:
          message.key.id
      }
    )

    return true
  } catch {
    return false
  }
}

function getInteractiveCommand(
  m
) {
  try {
    const msg =
      m.message ||
      m.msg ||
      {}

    const native =
      msg
        ?.interactiveResponseMessage
        ?.nativeFlowResponseMessage

    if (
      native?.paramsJson
    ) {
      const params =
        JSON.parse(
          native.paramsJson
        )

      const id =
        params.id ||
        params.selected_row_id ||
        params.selectedRowId

      if (
        typeof id ===
          'string' &&
        id.trim()
      ) {
        return id.trim()
      }
    }

    const response =
      msg
        ?.interactiveResponseMessage

    if (
      response?.nativeFlowResponseMessage
        ?.paramsJson
    ) {
      const params =
        JSON.parse(
          response
            .nativeFlowResponseMessage
            .paramsJson
        )

      if (
        typeof params.id ===
        'string'
      ) {
        return params.id
      }
    }

    return null
  } catch {
    return null
  }
}

async function sendCustomStickerPack(
  conn,
  m,
  pack,
  packName,
  packNumber,
  totalPacks
) {
  try {
    const zip =
      new JSZip()

    const stickersMetadata = []

    for (
      const item of pack
    ) {
      const buffer =
        toBuffer(
          item.buffer
        )

      if (!buffer) {
        continue
      }

      const fileName =
        `${toB64Url(
          sha256(buffer)
        )}.${item.ext}`

      zip.file(
        fileName,
        buffer
      )

      stickersMetadata.push({
        fileName,
        isAnimated:
          !!item.isAnimated,
        emojis: [''],
        accessibilityLabel: '',
        isLottie:
          !!item.isLottie,
        mimetype:
          item.mimetype
      })
    }

    if (
      !stickersMetadata.length
    ) {
      return false
    }

    const traySource =
      pack.find(
        x =>
          !x.isLottie
      )?.buffer

    const trayBuffer =
      traySource
        ? await makeTrayWebp(
            toBuffer(
              traySource
            )
          )
        : await makeBlankTrayWebp()

    if (!trayBuffer) {
      return false
    }

    const trayIconFileName =
      'tray_icon.webp'

    zip.file(
      trayIconFileName,
      trayBuffer
    )

    const archive =
      await zip.generateAsync(
        {
          type:
            'nodebuffer',
          compression:
            'STORE'
        }
      )

    const packUpload =
      await uploadToServer(
        conn,
        archive,
        {
          hkdf:
            'WhatsApp Sticker Pack Keys',
          mediaPath:
            '/mms/sticker-pack'
        }
      )

    if (!packUpload) {
      return false
    }

    const thumbnailBuffer =
      await makeThumbnailJpeg(
        trayBuffer
      )

    if (!thumbnailBuffer) {
      return false
    }

    const thumbUpload =
      await uploadToServer(
        conn,
        thumbnailBuffer,
        {
          hkdf:
            'WhatsApp Sticker Pack Thumbnail Keys',
          mediaPath:
            '/mms/thumbnail-sticker-pack',
          mediaKey:
            packUpload.mediaKey
        }
      )

    if (!thumbUpload) {
      return false
    }

    const name =
      totalPacks > 1
        ? `${packName} ${packNumber}`
        : packName

    await conn.relayMessage(
      m.chat,
      {
        messageContextInfo: {
          messageSecret:
            crypto.randomBytes(
              32
            )
        },

        stickerPackMessage: {
          stickerPackId:
            `Pack_${crypto
              .randomBytes(8)
              .toString('hex')}`,

          name,

          publisher:
            'Sticker Search',

          packDescription:
            totalPacks > 1
              ? `${packName} - Pack ${packNumber}/${totalPacks}`
              : packName,

          stickers:
            stickersMetadata,

          fileLength:
            packUpload.fileLength,

          fileSha256:
            packUpload.fileSha256,

          fileEncSha256:
            packUpload.fileEncSha256,

          mediaKey:
            packUpload.mediaKey,

          directPath:
            packUpload.directPath,

          mediaKeyTimestamp:
            Math.floor(
              Date.now() / 1000
            ),

          stickerPackSize:
            packUpload.fileLength,

          stickerPackOrigin:
            2,

          trayIconFileName,

          thumbnailDirectPath:
            thumbUpload.directPath,

          thumbnailSha256:
            thumbUpload.fileSha256,

          thumbnailEncSha256:
            thumbUpload.fileEncSha256,

          thumbnailHeight:
            252,

          thumbnailWidth:
            252,

          imageDataHash:
            thumbUpload.fileSha256
              .toString(
                'base64'
              )
        }
      },
      {
        quoted: m
      }
    )

    return true
  } catch {
    return false
  }
}

async function processStickerPack(
  conn,
  m,
  telegramName,
  status
) {
  try {
    const pack =
      await getStickerPack(
        telegramName
      )

    if (!pack) {
      await editMessage(
        conn,
        m,
        status,
        '❌ Sticker pack Telegram tidak ditemukan.'
      )

      return
    }

    const stickers =
      pack.stickers || []

    if (!stickers.length) {
      await editMessage(
        conn,
        m,
        status,
        '❌ Sticker pack kosong.'
      )

      return
    }

    await editMessage(
      conn,
      m,
      status,
      `⏱️ Mengambil sticker...\n\n` +
      `Nama: ${pack.title}\n` +
      `Progress: 0%\n` +
      `Berhasil: 0\n` +
      `Gagal/skip: 0`
    )

    const items = []
    let failed = 0
    let lastProgress = -1

    for (
      let i = 0;
      i < stickers.length;
      i++
    ) {
      try {
        const sticker =
          stickers[i]

        const result =
          await downloadSticker(
            sticker.file_id
          )

        if (!result) {
          failed++
          continue
        }

        let buffer =
          result.buffer

        const filePath =
          String(
            result.filePath ||
            ''
          ).toLowerCase()

        let ext = 'webp'
        let mimetype =
          'image/webp'

        let isAnimated =
          false

        let isLottie =
          false

        if (
          filePath.endsWith(
            '.webm'
          )
        ) {
          const converted =
            await webmToWebp(
              buffer
            )

          if (!converted) {
            failed++
            continue
          }

          buffer =
            converted

          isAnimated =
            true
        } else if (
          filePath.endsWith(
            '.tgs'
          )
        ) {
          failed++
          continue
        } else {
          isAnimated =
            isAnimatedWebP(
              buffer
            )
        }

        if (!buffer) {
          failed++
          continue
        }

        items.push({
          buffer,
          ext,
          mimetype,
          isAnimated,
          isLottie
        })
      } catch {
        failed++
      }

      const percent =
        Math.floor(
          ((i + 1) /
            stickers.length) *
            100
        )

      const progress =
        Math.floor(
          percent / 5
        ) * 5

      if (
        progress !==
          lastProgress ||
        i + 1 ===
          stickers.length
      ) {
        lastProgress =
          progress

        await editMessage(
          conn,
          m,
          status,
          `⏱️ Mengambil sticker...\n\n` +
          `Nama: ${pack.title}\n` +
          `Progress: ${percent}%\n` +
          `Berhasil: ${items.length}\n` +
          `Gagal/skip: ${failed}`
        )
      }
    }

    if (!items.length) {
      await editMessage(
        conn,
        m,
        status,
        '❌ Tidak ada sticker yang berhasil diproses.'
      )

      return
    }

    const MAX =
      60

    const packs = []

    for (
      let i = 0;
      i < items.length;
      i += MAX
    ) {
      packs.push(
        items.slice(
          i,
          i + MAX
        )
      )
    }

    await editMessage(
      conn,
      m,
      status,
      `⏱️ Membuat ${packs.length} sticker pack...\n\n` +
      `Nama: ${pack.title}\n` +
      `Sticker: ${items.length}/${stickers.length}`
    )

    for (
      let i = 0;
      i < packs.length;
      i++
    ) {
      await editMessage(
        conn,
        m,
        status,
        `⏱️ Membuat pack ${i + 1}/${packs.length}...\n\n` +
        `Nama: ${pack.title}\n` +
        `Isi: ${packs[i].length} sticker`
      )

      const success =
        await sendCustomStickerPack(
          conn,
          m,
          packs[i],
          pack.title,
          i + 1,
          packs.length
        )

      if (!success) {
        await editMessage(
          conn,
          m,
          status,
          `❌ Gagal membuat pack ${i + 1}.`
        )

        return
      }
    }

    await editMessage(
      conn,
      m,
      status,
      `✅ Selesai!\n\n` +
      `Nama: ${pack.title}\n` +
      `Sticker: ${items.length}/${stickers.length}\n` +
      `WhatsApp pack: ${packs.length}` +
      (
        failed
          ? `\nGagal/skip: ${failed}`
          : ''
      )
    )
  } catch (e) {
    await editMessage(
      conn,
      m,
      status,
      `❌ Error: ${e?.message || e}`
    )
  }
}

const handler = async (
  m,
  {
    text,
    conn
  }
) => {
  let status = null

  await react(
    conn,
    m,
    '⏱️'
  )

  try {
    /*
     * Ambil command normal
     */
    let input =
      String(
        m.text ||
        text ||
        ''
      ).trim()

    /*
     * Kalau berasal dari Interactive Message,
     * ambil selected row ID dari nativeFlowResponseMessage.
     */
    const interactiveId =
      getInteractiveCommand(m)

    if (
      interactiveId
    ) {
      input =
        interactiveId
    }

    /*
     * Normalisasi command
     */
    const parts =
      input
        .trim()
        .split(/\s+/)

    const command =
      String(
        parts.shift() ||
        ''
      ).toLowerCase()

    const commandText =
      parts.join(' ').trim()

    /*
     * =========================
     * STICKER SEARCH
     * =========================
     */

    if (
      command ===
        '.stickersearch' ||
      command ===
        'stickersearch'
    ) {
      status =
        await m.reply(
          '⏱️ Mencari sticker pack...'
        )

      const query =
        commandText

      if (!query) {
        await editMessage(
          conn,
          m,
          status,
          '❌ Masukkan keyword.\n\n' +
          'Contoh:\n' +
          '.stickersearch kucing'
        )

        return
      }

      const packs =
        await searchStickerPacks(
          query
        )

      if (!packs.length) {
        await editMessage(
          conn,
          m,
          status,
          `❌ Sticker pack "${query}" tidak ditemukan.`
        )

        return
      }

      await editMessage(
        conn,
        m,
        status,
        `✅ Ditemukan ${packs.length} sticker pack.`
      )

      const sent =
        await sendStickerSearchList(
          conn,
          m,
          query,
          packs
        )

      if (!sent) {
        await editMessage(
          conn,
          m,
          status,
          '❌ Gagal mengirim Interactive Message.'
        )
      }

      return
    }

    /*
     * =========================
     * STICKER PACK GET
     * =========================
     */

    if (
      command ===
        '.stickerpack_get' ||
      command ===
        'stickerpack_get'
    ) {
      status =
        await m.reply(
          '⏱️ Memproses sticker pack...'
        )

      const match =
        commandText.match(
          /(?:https?:\/\/)?t\.me\/addstickers\/([A-Za-z0-9_]+)/i
        )

      if (!match?.[1]) {
        await editMessage(
          conn,
          m,
          status,
          '❌ URL sticker pack tidak valid.'
        )

        return
      }

      await processStickerPack(
        conn,
        m,
        match[1],
        status
      )

      return
    }
  } catch (e) {
    if (status) {
      await editMessage(
        conn,
        m,
        status,
        `❌ Error: ${e?.message || e}`
      )
    } else {
      await m.reply(
        `❌ Error: ${e?.message || e}`
      )
    }
  } finally {
    await react(
      conn,
      m,
      ''
    )
  }
}

handler.help = [
  'stickersearch <query>',
  'stickerpack_get <url>'
]

handler.tags = [
  'sticker'
]

handler.command =
  /^(stickersearch|stickerpack_get)$/i

handler.limit = true

export default handler
