/*
# Name : Scan Ai slop image
# Type : CJS
# Url : https://hivedetect.a
# Snippet : https://snippet.zellrayy.com/ZyvKdUPVrD
# Source : https://whatsapp.com/channel/0029VbDWBmtA89MamPba8q3f
*/
try {
    const axios = require('axios')
    const FormData = require('form-data')

    const quoted = m.quoted || m
    const mime = quoted.mimetype || quoted.msg?.mimetype || ''

    if (!/^image\/(jpeg|jpg|png|webp)$/i.test(mime)) {
        return m.reply('Reply gambar yang ingin diperiksa.')
    }

    await m.reply('Sedang memeriksa gambar...')

    const buffer = await quoted.download()
    if (!buffer?.length) return m.reply('Gagal mengunduh gambar.')

    const baseURL = 'https://hivedetect.ai'

    const headers = {
        accept: 'application/json, text/plain, */*',
        origin: baseURL,
        referer: `${baseURL}/new`,
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
    }

    const form = new FormData()
    form.append('media', buffer, {
        filename: `image.${mime.split('/')[1]}`,
        contentType: mime
    })

    const upload = await axios.post(
        `${baseURL}/api/v1/upload`,
        form,
        {
            headers: { ...headers, ...form.getHeaders() },
            timeout: 120000,
            maxBodyLength: Infinity
        }
    )

    const key = upload.data?.data?.short_key
    if (!key) return m.reply('Gagal mengunggah gambar.')

    const { data } = await axios.get(
        `${baseURL}/json/${key}.json`,
        { headers, timeout: 60000 }
    )

    const classes = data?.visual?.status?.[0]?.response?.output?.[0]?.classes

    if (!Array.isArray(classes)) {
        return m.reply('Hasil deteksi belum tersedia.')
    }

    const ai = classes.find(v => v.class === 'ai_generated')?.score
    const human = classes.find(v => v.class === 'not_ai_generated')?.score
    const deepfake = classes.find(v => v.class === 'deepfake')?.score

    const persen = n =>
        typeof n === 'number' ? (n * 100).toFixed(2) + '%' : 'Tidak tersedia'

    const hasil = typeof ai === 'number' && typeof human === 'number'
        ? ai > human
            ? 'Kemungkinan gambar dibuat oleh AI.'
            : 'Kemungkinan gambar bukan hasil AI.'
        : 'Hasil belum dapat disimpulkan.'

    await m.reply(
        `HIVE DETECT — HASIL PEMERIKSAAN\n\n` +
        `Status: ${hasil}\n\n` +
        `AI Generated: ${persen(ai)}\n` +
        `Not AI Generated: ${persen(human)}\n` +
        `Deepfake: ${persen(deepfake)}\n\n` +
        `Short Key: ${key}\n` +
        `Catatan: Hasil merupakan estimasi model deteksi, bukan kepastian mutlak.`
    )
} catch (e) {
    await m.reply(
        `Gagal memeriksa gambar.\n${typeof e.response?.data === 'string' ? e.response.data : e.message}`
    )
}