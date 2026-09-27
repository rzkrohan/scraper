import axios from 'axios'
import crypto from 'crypto'
import https from 'https'
import JSZip from 'jszip'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { writeFile, readFile, unlink } from 'fs/promises'
import path from 'path'
import os from 'os'

const exec = promisify(execFile)

const TOKEN = '8414626284:AAEZUOR1mXWICGcHA37bvI6zLYrdMRCwyIE'

function toBuffer(value) {
    if (Buffer.isBuffer(value)) return value

    if (
        value &&
        value.type === 'Buffer' &&
        Array.isArray(value.data)
    ) {
        return Buffer.from(value.data)
    }

    if (typeof value === 'string') {
        return Buffer.from(value, 'base64')
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
        buffer.toString('ascii', 0, 4) === 'RIFF' &&
        buffer.toString('ascii', 8, 12) === 'WEBP'
    )
}

function isAnimatedWebP(buffer) {
    if (!isWebP(buffer)) return false

    let offset = 12

    while (offset < buffer.length - 8) {
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

        offset += 8 + size + (size % 2)
    }

    return false
}

function classifySticker(
    buffer,
    sticker = {}
) {
    if (sticker.isLottie) {
        return {
            ext: 'json',
            mimetype: 'application/json',
            isAnimated: true,
            isLottie: true
        }
    }

    return {
        ext: 'webp',
        mimetype: 'image/webp',
        isAnimated:
            isAnimatedWebP(buffer),
        isLottie: false
    }
}

async function webmToWebp(buffer) {
    const id =
        `${Date.now()}_${Math.random().toString(36).slice(2)}`

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
    } finally {
        await unlink(input)
            .catch(() => {})

        await unlink(output)
            .catch(() => {})
    }
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
        return Promise.reject(
            new Error(
                'sharp belum terinstall. npm i sharp'
            )
        )
    }

    return sharp(
        buffer,
        {
            animated: false
        }
    )
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
        return Promise.reject(
            new Error(
                'sharp belum terinstall. npm i sharp'
            )
        )
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

async function makeThumbnailJpeg(buffer) {
    const sharp =
        await getSharp()

    if (!sharp) {
        return Promise.reject(
            new Error(
                'sharp belum terinstall. npm i sharp'
            )
        )
    }

    return sharp(buffer)
        .resize(252, 252, {
            fit: 'cover'
        })
        .jpeg()
        .toBuffer()
}

async function uploadToServer(
    conn,
    buffer,
    {
        hkdf,
        mediaPath,
        mediaKey =
            crypto.randomBytes(32)
    }
) {
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
        expanded.subarray(0, 16)

    const cipherKey =
        expanded.subarray(16, 48)

    const macKey =
        expanded.subarray(48, 80)

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
                    conn.generateMessageTag?.() ??
                    Date.now().toString(),

                to:
                    's.whatsapp.net',

                type:
                    'set',

                xmlns:
                    'w:m'
            },

            content: [
                {
                    tag:
                        'media_conn',

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
        return Promise.reject(
            new Error(
                'media_conn tidak ditemukan'
            )
        )
    }

    const auth =
        mediaConn.attrs?.auth

    if (!auth) {
        return Promise.reject(
            new Error(
                'auth media_conn tidak ditemukan'
            )
        )
    }

    const hosts =
        (mediaConn.content || [])
            .filter(
                x =>
                    x.tag ===
                    'host'
            )
            .map(
                x =>
                    x.attrs?.hostname
            )
            .filter(Boolean)

    if (!hosts.length) {
        return Promise.reject(
            new Error(
                'host upload tidak ditemukan'
            )
        )
    }

    const token =
        encodeURIComponent(
            fileEncSha256
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/g, '')
        )

    let lastError = null

    for (const host of hosts) {
        try {
            const result =
                await new Promise(
                    (
                        resolve,
                        reject
                    ) => {
                        const url =
                            new URL(
                                `https://${host}${mediaPath}/${token}?auth=${encodeURIComponent(auth)}&token=${token}`
                            )

                        const req =
                            https.request(
                                {
                                    hostname:
                                        url.hostname,

                                    port:
                                        443,

                                    path:
                                        url.pathname +
                                        url.search,

                                    method:
                                        'POST',

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
                                                res.statusCode < 200 ||
                                                res.statusCode >= 300
                                            ) {
                                                return reject(
                                                    new Error(
                                                        `Upload gagal ${res.statusCode}: ${body}`
                                                    )
                                                )
                                            }

                                            try {
                                                resolve(
                                                    JSON.parse(
                                                        body
                                                    )
                                                )
                                            } catch {
                                                reject(
                                                    new Error(
                                                        `Response bukan JSON: ${body}`
                                                    )
                                                )
                                            }
                                        }
                                    )
                                }
                            )

                        req.on(
                            'error',
                            reject
                        )

                        req.write(
                            encBuffer
                        )

                        req.end()
                    }
                )

            const directPath =
                result.direct_path ??
                result.directPath ??
                result.url ??
                result.path

            if (!directPath) {
                lastError =
                    new Error(
                        'directPath tidak ditemukan'
                    )

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

        } catch (e) {
            lastError = e
        }
    }

    return Promise.reject(
        lastError ||
        new Error(
            'Semua host upload gagal'
        )
    )
}

async function getStickerPack(name) {
    const { data } =
        await axios.get(
            `https://api.telegram.org/bot${TOKEN}/getStickerSet`,
            {
                params: {
                    name
                }
            }
        )

    if (!data.ok) {
        return Promise.reject(
            new Error(
                data.description ||
                'Gagal mengambil sticker pack'
            )
        )
    }

    return data.result
}

async function downloadSticker(
    fileId
) {
    const { data: file } =
        await axios.get(
            `https://api.telegram.org/bot${TOKEN}/getFile`,
            {
                params: {
                    file_id:
                        fileId
                }
            }
        )

    if (!file.ok) {
        return Promise.reject(
            new Error(
                file.description ||
                'Gagal mengambil file'
            )
        )
    }

    const filePath =
        file.result.file_path

    const { data } =
        await axios.get(
            `https://api.telegram.org/file/bot${TOKEN}/${filePath}`,
            {
                responseType:
                    'arraybuffer'
            }
        )

    return {
        buffer:
            Buffer.from(data),

        filePath
    }
}

async function sendCustomStickerPack(
    conn,
    m,
    pack,
    packName,
    packNumber,
    totalPack
) {
    const zip =
        new JSZip()

    const stickersMetadata = []

    for (const item of pack) {
        const buffer =
            toBuffer(item.buffer)

        if (!buffer) continue

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

            emojis:
                [''],

            accessibilityLabel:
                '',

            isLottie:
                !!item.isLottie,

            mimetype:
                item.mimetype
        })
    }

    const trayIconFileName =
        'tray_icon.webp'

    const traySource =
        pack.find(
            x =>
                !x.isLottie
        )?.buffer

    const trayBuffer =
        traySource
            ? await makeTrayWebp(
                toBuffer(traySource)
            )
            : await makeBlankTrayWebp()

    zip.file(
        trayIconFileName,
        trayBuffer
    )

    const archive =
        await zip.generateAsync({
            type:
                'nodebuffer',

            compression:
                'STORE'
        })

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

    const thumbnailBuffer =
        await makeThumbnailJpeg(
            trayBuffer
        )

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

    const finalName =
        totalPack > 1
            ? `${packName} ${packNumber}`
            : packName

    await conn.relayMessage(
        m.chat,
        {
            messageContextInfo: {
                messageSecret:
                    crypto.randomBytes(32)
            },

            stickerPackMessage: {
                stickerPackId:
                    'Pack_' +
                    crypto
                        .randomBytes(8)
                        .toString('hex'),

                name:
                    finalName,

                publisher:
                    'WhatsApp Stickerpack',

                packDescription:
                    totalPack > 1
                        ? `${packName} - Pack ${packNumber}/${totalPack}`
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
                        .toString('base64')
            }
        },
        {
            quoted:
                m
        }
    )
}

const handler = async (
    m,
    {
        text,
        conn
    }
) => {
    const status =
        await m.reply(
            '⏱️ Memproses sticker pack Telegram...'
        )

    const edit = async text => {
        try {
            await conn.relayMessage(
                m.chat,
                {
                    protocolMessage: {
                        key: status.key,
                        type: 14,
                        editedMessage: {
                            conversation:
                                text
                        }
                    }
                },
                {}
            )
        } catch {}
    }

    try {
        if (!text) {
            return edit(
                '❌ URL sticker pack belum diberikan.\n\n' +
                'Contoh:\n' +
                '.stickertele https://t.me/addstickers/nama_pack'
            )
        }

        const match =
            text.match(
                /https?:\/\/t\.me\/addstickers\/([^/?#]+)/
            )

        if (!match) {
            return edit(
                '❌ URL Telegram sticker pack tidak valid.\n\n' +
                'Contoh:\n' +
                '.stickertele https://t.me/addstickers/nama_pack'
            )
        }

        await edit(
            '⏱️ Mengambil informasi sticker pack...'
        )

        const pack =
            await getStickerPack(
                match[1]
            )

        const total =
            pack.stickers.length

        await edit(
            `⏱️ Mengambil sticker...\n\n` +
            `Nama: ${pack.title}\n` +
            `Progress: 0/${total}`
        )

        const items = []

        let failed = 0

        for (
            let i = 0;
            i < total;
            i++
        ) {
            const sticker =
                pack.stickers[i]

            try {
                let {
                    buffer,
                    filePath
                } =
                    await downloadSticker(
                        sticker.file_id
                    )

                const lower =
                    filePath.toLowerCase()

                let ext =
                    'webp'

                let mimetype =
                    'image/webp'

                let isAnimated =
                    false

                let isLottie =
                    false

                if (
                    lower.endsWith(
                        '.webm'
                    )
                ) {
                    buffer =
                        await webmToWebp(
                            buffer
                        )

                    isAnimated =
                        true

                } else if (
                    lower.endsWith(
                        '.tgs'
                    )
                ) {
                    failed++
                    continue

                } else {
                    const info =
                        classifySticker(
                            buffer,
                            sticker
                        )

                    ext =
                        info.ext

                    mimetype =
                        info.mimetype

                    isAnimated =
                        info.isAnimated

                    isLottie =
                        info.isLottie
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

            await edit(
                `⏱️ Mengambil sticker...\n\n` +
                `Nama: ${pack.title}\n` +
                `Progress: ${i + 1}/${total}\n` +
                `Berhasil: ${items.length}\n` +
                `Gagal/skip: ${failed}`
            )
        }

        if (!items.length) {
            return edit(
                `❌ Tidak ada sticker yang berhasil diproses.\n\n` +
                `Pack: ${pack.title}`
            )
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

        await edit(
            `⏱️ Menyiapkan sticker pack...\n\n` +
            `Nama: ${pack.title}\n` +
            `Sticker: ${items.length}/${total}\n` +
            `WhatsApp pack: ${packs.length}\n` +
            `Maksimal: 60 sticker/pack`
        )

        for (
            let i = 0;
            i < packs.length;
            i++
        ) {
            await edit(
                `⏱️ Membuat pack ${i + 1}/${packs.length}...\n\n` +
                `Nama: ${pack.title}${packs.length > 1 ? ` ${i + 1}` : ''}\n` +
                `Isi: ${packs[i].length} sticker`
            )

            await sendCustomStickerPack(
                conn,
                m,
                packs[i],
                pack.title,
                i + 1,
                packs.length
            )
        }

        return edit(
            `✅ Selesai!\n\n` +
            `Nama: ${pack.title}\n` +
            `Sticker: ${items.length}/${total}\n` +
            `Pack: ${packs.length}` +
            (
                failed
                    ? `\nGagal/skip: ${failed}`
                    : ''
            )
        )

    } catch (e) {
        return edit(
            `❌ Gagal memproses sticker pack.\n\n${e.message}`
        )
    }
}

handler.help = [
    'stickertele <url>'
]

handler.tags = [
    'sticker'
]

handler.command =
    /^stickertele$/i

handler.limit = true

export default handler