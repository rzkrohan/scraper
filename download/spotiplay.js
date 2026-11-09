/*
# Name : Spotify Play Music
# Type : CJS
# Url : https://spotmp3.net, https://spotsaver.net
# Snippet : https://snippet.zellrayy.com/XmsGK2KXbS
# Source : https://whatsapp.com/channel/0029VbDWBmtA89MamPba8q3f
*/

const axios = require('axios')

try {
  const baseUrl = 'https://spotmp3.net'

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    Accept: 'application/json, text/plain, */*',
    Origin: 'https://spotsaver.net',
    Referer: 'https://spotsaver.net/'
  }

  const fmtDuration = ms => {
    if (!ms || isNaN(ms)) return null
    const s = Math.round(Number(ms) / 1000)
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  }

  async function searchSpotify(query) {
    const { data } = await axios.get(`${baseUrl}/api/v1/search`, {
      params: { q: query },
      headers,
      timeout: 30000
    })

    const tracks = data?.sections?.find(v => v.type === 'track')?.items || []

    return tracks.map(item => {
      const tid = item.id || item.url?.match(/track\/([A-Za-z0-9]+)/)?.[1] || null

      return {
        title: item.title || null,
        artist: item.subtitle || null,
        album: item.album || null,
        duration: fmtDuration(item.duration_ms),
        cover: item.cover || item.image || item.thumbnail || null,
        date: item.date || item.release_date || null,
        tid,
        spotifyUrl: item.url || (tid ? `https://open.spotify.com/track/${tid}` : null)
      }
    })
  }

  async function downloadSpotify(url) {
    const spotify = await axios.get('https://spotsaver.net/api/spotify/', {
      params: { url },
      headers,
      timeout: 30000
    })

    const item = spotify.data?.items?.[0]
    if (!item) return { error: 'Track Spotify tidak ditemukan.' }

    const cover = item.cover || item.image || item.thumbnail || item.album?.cover || item.album?.image || null

    const getId = await axios.post(
      'https://spotsaver.net/api/get-id/',
      { title: item.title, artist: item.artist },
      {
        headers: { ...headers, 'Content-Type': 'application/json' },
        timeout: 30000
      }
    )

    const videoId = getId.data?.videoId
    if (!videoId) return { error: 'Video ID tidak ditemukan.' }

    const download = await axios.post(
      'https://spotsaver.net/api/download/',
      {
        videoId,
        candidateIds: [],
        format: 'mp3',
        title: `${item.title} - ${item.artist}`,
        licenseKey: null
      },
      {
        headers: { ...headers, 'Content-Type': 'application/json' },
        timeout: 60000
      }
    )

    const downloadUrl =
      download.data?.url ||
      download.data?.download ||
      download.data?.downloadUrl ||
      download.data?.audio ||
      download.data?.result?.url ||
      download.data?.result?.download ||
      null

    if (!downloadUrl) return { error: 'URL download tidak ditemukan.' }

    const tid = url.match(/track\/([A-Za-z0-9]+)/)?.[1]

    return {
      title: item.title || null,
      artist: item.artist || null,
      album: item.album || null,
      duration: item.duration || null,
      cover,
      date: item.release_date || item.date || null,
      spotify: tid ? `https://open.spotify.com/track/${tid}` : url,
      download: downloadUrl
    }
  }

  const query = 'shape of you'

  const results = await searchSpotify(query)

  if (!results.length) {
    await m.reply(JSON.stringify({
      success: false,
      message: 'Lagu tidak ditemukan.'
    }, null, 2))
  } else {
    const first = results[0]

    if (!first.spotifyUrl) {
      await m.reply(JSON.stringify({
        success: false,
        message: 'URL Spotify tidak ditemukan.'
      }, null, 2))
    } else {
      const result = await downloadSpotify(first.spotifyUrl)

      await m.reply(JSON.stringify({
        success: !result.error,
        query,
        search: first,
        result
      }, null, 2))
    }
  }
} catch (e) {
  await m.reply(JSON.stringify({
    success: false,
    error: e.response?.data?.message ||
      e.response?.data?.error ||
      e.message
  }, null, 2))
}