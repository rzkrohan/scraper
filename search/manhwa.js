/*
# Name : Baca Manhwa
# Type : CJS
# Url : https://manwhaku.my.id
# Snippet : https://snippet.zellrayy.com/axnDpcaH8M
# Source : https://whatsapp.com/channel/0029VbDWBmtA89MamPba8q3f
*/

(async () => {
  try {
    const axios = require('axios')
    const BASE = 'https://manwhaku.my.id'

    const client = axios.create({
      baseURL: BASE,
      timeout: 30000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    })

    let csrf = null

    const get = async (url, options = {}) => {
      const res = await client.get(url, options)
      for (const cookie of res.headers['set-cookie'] || []) {
        const match = cookie.match(/mw_csrf=([^;]+)/)
        if (match) {
          csrf = match[1]
          client.defaults.headers.common.Cookie = `mw_csrf=${csrf}`
        }
      }
      return res
    }

    const init = async () => {
      if (!csrf) await get('/')
      if (!csrf) await get('/api/auth/get-session')
    }

    const extractChapter = (html, number) => {
      const match = html.match(new RegExp(`bkch_https%3A%2F%2F[^"\\\\]+chapter-${number}%2F`, 'i'))
      if (match) return match[0]
      return html.match(/firstChapterSlug\\":\\"([^\\"]+)\\"/)?.[1] || null
    }

    const Search = async query => {
      try {
        await init()
        const res = await get(`/manga?q=${encodeURIComponent(query)}`)
        const html = typeof res.data === 'string' ? res.data : JSON.stringify(res.data)
        const ids = [...new Set(html.match(/bk_[a-z0-9_-]+/gi) || [])]

        return {
          success: true,
          query,
          total: ids.length,
          results: ids.map(id => ({
            id,
            url: `${BASE}/manga/${id}`
          }))
        }
      } catch (e) {
        return { success: false, error: e.message, status: e.response?.status || null }
      }
    }

    const Baca = async (input, chapterNum = 1) => {
      try {
        await init()

        let mangaId = null
        let chapterId = null

        if (/^https?:\/\//i.test(input)) {
          const url = new URL(input)
          if (url.hostname !== 'manwhaku.my.id') {
            return { success: false, error: 'Domain URL tidak valid' }
          }

          const parts = url.pathname.split('/').filter(Boolean)
          if (parts[0] === 'read' && parts[1]) chapterId = parts[1]
          else if (parts[0] === 'manga' && parts[1]) mangaId = parts[1]
          else return { success: false, error: 'URL manga/chapter tidak valid' }
        } else {
          input = String(input).trim()
          if (/^bkch_/i.test(input)) chapterId = input
          else mangaId = input
        }

        if (mangaId) {
          const res = await get(`/manga/${mangaId}`)
          const html = typeof res.data === 'string' ? res.data : JSON.stringify(res.data)
          chapterId = extractChapter(html, chapterNum)

          if (!chapterId) {
            return {
              success: false,
              error: `Chapter ${chapterNum} tidak ditemukan`,
              manga: mangaId
            }
          }
        }

        const chapterUrl = `${BASE}/read/${chapterId}`
        const res = await get(`/read/${chapterId}`)
        const html = typeof res.data === 'string' ? res.data : JSON.stringify(res.data)
        const tokens = [...new Set((html.match(/\/api\/view\/[A-Za-z0-9_-]+/g) || []).map(x => x.replace('/api/view/', '')))]

        if (!tokens.length) {
          return { success: false, error: 'Token gambar tidak ditemukan', chapter: chapterId }
        }

        return {
          success: true,
          chapter: { id: chapterId, url: chapterUrl },
          totalPages: tokens.length,
          pages: tokens.map((token, i) => ({
            page: i + 1,
            token,
            url: `${BASE}/api/view/${token}`
          }))
        }
      } catch (e) {
        return { success: false, error: e.message, status: e.response?.status || null }
      }
    }

    const result = await Search('lookism') 
    await m.reply(JSON.stringify(result, null, 2))
  } catch (e) {
    await m.reply(JSON.stringify({
      success: false,
      error: e.message
    }, null, 2))
  }
})()

/* Penggunaan
const result = await Search('lookism') > Search Manhwa

const result = await Baca('https://manwhaku.my.id/manga/bk_manager-kim') > Membaca
*