/*
# Name : Spotify Play (FAST)
# Type : CJS
# Url : https://spotidown(.)app
# Snippet : https://snippet.zellrayy.com/RSufERcanr
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/
const axios = require('axios')
const cheerio = require('cheerio')
const qs = require('qs')

const baseUrl = 'https://spotidown.app'

const userAgent =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

async function getSession() {
  const res = await axios.get(`${baseUrl}/en3`, {
    headers: {
      'User-Agent': userAgent,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  })

  const cookie = (res.headers['set-cookie'] || [])
    .map(v => v.split(';')[0])
    .join('; ')

  const $ = cheerio.load(res.data)

  let dynamicName = ''
  let dynamicValue = ''

  $('form[name="spotifyurl"] input[type="hidden"]').each((_, el) => {
    const name = $(el).attr('name')
    const value = $(el).attr('value')

    if (name && name !== 'g-recaptcha-response') {
      dynamicName = name
      dynamicValue = value
    }
  })

  return {
    cookie,
    dynamicName,
    dynamicValue
  }
}

async function searchSpotify(query) {
  const {
    cookie,
    dynamicName,
    dynamicValue
  } = await getSession()

  const payload = {
    url: query,
    'g-recaptcha-response': ''
  }

  if (dynamicName) {
    payload[dynamicName] = dynamicValue
  }

  const res = await axios.post(
    `${baseUrl}/action`,
    qs.stringify(payload),
    {
      headers: {
        'User-Agent': userAgent,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Origin: baseUrl,
        Referer: `${baseUrl}/en3`,
        'X-Requested-With': 'XMLHttpRequest',
        Cookie: cookie
      }
    }
  )

  if (res.data?.error) {
    throw new Error(
      res.data.message ||
      'Search Spotify gagal'
    )
  }

  const $ = cheerio.load(res.data?.data || '')

  const results = []

  $('form[name="submitspurl"]').each((_, el) => {
    const data = $(el).find('input[name="data"]').val()
    const base = $(el).find('input[name="base"]').val()
    const token = $(el).find('input[name="token"]').val()

    if (!data) return

    try {
      const meta = JSON.parse(
        Buffer.from(data, 'base64').toString()
      )

      results.push({
        title: meta.name || null,
        artist: meta.artist || null,
        album: meta.album || null,
        duration: meta.duration || null,
        cover: meta.cover || null,
        date: meta.date || null,
        tid: meta.tid || null,
        spotifyUrl: meta.tid
          ? `https://open.spotify.com/track/${meta.tid}`
          : null
      })
    } catch {}
  })

  return results
}

async function downloadSpotify(url) {
  const {
    cookie,
    dynamicName,
    dynamicValue
  } = await getSession()

  const payload = {
    url,
    'g-recaptcha-response': ''
  }

  if (dynamicName) {
    payload[dynamicName] = dynamicValue
  }

  const search = await axios.post(
    `${baseUrl}/action`,
    qs.stringify(payload),
    {
      headers: {
        'User-Agent': userAgent,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Origin: baseUrl,
        Referer: `${baseUrl}/en3`,
        Cookie: cookie,
        'X-Requested-With': 'XMLHttpRequest'
      }
    }
  )

  if (search.data?.error) {
    throw new Error(
      search.data.message ||
      'Gagal mengambil lagu'
    )
  }

  const $ = cheerio.load(search.data?.data || '')

  const form = {
    data: $('input[name="data"]').val(),
    base: $('input[name="base"]').val(),
    token: $('input[name="token"]').val()
  }

  if (!form.data) {
    throw new Error(
      'Gagal mengambil data lagu'
    )
  }

  let metadata

  try {
    metadata = JSON.parse(
      Buffer.from(
        form.data,
        'base64'
      ).toString()
    )
  } catch {
    throw new Error(
      'Gagal membaca metadata lagu'
    )
  }

  const dl = await axios.post(
    `${baseUrl}/action/track`,
    qs.stringify(form),
    {
      headers: {
        'User-Agent': userAgent,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Origin: baseUrl,
        Referer: `${baseUrl}/en3`,
        Cookie: cookie,
        'X-Requested-With': 'XMLHttpRequest'
      }
    }
  )

  if (dl.data?.error) {
    throw new Error(
      dl.data.message ||
      'Download lagu gagal'
    )
  }

  const $$ = cheerio.load(
    dl.data?.data || ''
  )

  let mp3 = null
  let cover = null

  $$('a').each((_, el) => {
    const href = $$(el).attr('href')
    const text = $$(el)
      .text()
      .trim()
      .toLowerCase()

    if (
      text.includes('download mp3') ||
      text.includes('download audio')
    ) {
      mp3 = href
    }

    if (text.includes('download cover')) {
      cover = href
    }
  })

  return {
    title: metadata.name || null,
    artist: metadata.artist || null,
    album: metadata.album || null,
    duration: metadata.duration || null,
    cover: cover || metadata.cover || null,
    date: metadata.date || null,
    spotify: metadata.tid
      ? `https://open.spotify.com/track/${metadata.tid}`
      : url,
    download: mp3
  }
}

async function SpotifyPlay(query) {
  if (!query) {
    throw new Error('Query lagu diperlukan')
  }

  const results = await searchSpotify(query)

  if (!results.length) {
    throw new Error('Lagu tidak ditemukan')
  }

  const first = results[0]

  if (!first.spotifyUrl) {
    throw new Error(
      'URL Spotify lagu tidak ditemukan'
    )
  }

  const download = await downloadSpotify(
    first.spotifyUrl
  )

  return {
    success: true,
    query,
    search: first,
    result: download
  }
}

async function main() {
  try {
    const query = 'love yourself'

    const result = await SpotifyPlay(query)

    console.log(
      JSON.stringify(result, null, 2)
    )
  } catch (error) {
    console.error({
      success: false,
      message: error.message
    })
  }
}

main()

/* # RESULT
{
  "success": true,
  "query": "love yourself",
  "search": {
    "title": "Love Yourself",
    "artist": "Justin Bieber",
    "album": "Purpose (Deluxe)",
    "duration": "3:53",
    "cover": "https://i.scdn.co/image/ab67616d0000b273f46b9d202509a8f7384b90de",
    "date": null,
    "tid": "50kpGaPAhYJ3sGmk6vplg0",
    "spotifyUrl": "https://open.spotify.com/track/50kpGaPAhYJ3sGmk6vplg0"
  },
  "result": {
    "title": "Love Yourself",
    "artist": "Justin Bieber",
    "album": "Purpose (Deluxe)",
    "duration": "3:53",
    "cover": "https://rapid.spotidown.app/v2?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaWxlbmFtZSI6IkxvdmUgWW91cnNlbGYgLSBKdXN0aW4gQmllYmVyIiwiaWF0IjoxNzg4NDI1OTQxLCJleHAiOjE3ODg0Mjk1NDEsImNvdmVyIjoiTTNac09HZEZkMnRSVVRoeFlXVkRiMEZYVUdOVWFqRm9ja1pVTXpkYVdVVkRaWGgyVFdweEsxVXZNMU13YURKRFMyNVRZbEJzYkRkeFNIUnVXbmREYUZaQ1ZtZzBNVXh0TUc5UE0wWlZiRVZtZDNKdGRrcEJObEZITUVGVk0zSnZZbWMxTkVkTFlYRlBUVUU5In0.4WGCArfwwWksaTtRfNlU7OMDH_ZO19va71H1305a1is",
    "date": 2015,
    "spotify": "https://open.spotify.com/track/50kpGaPAhYJ3sGmk6vplg0",
    "download": "https://rapid.spotidown.app/v2?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmaWxlbmFtZSI6IkxvdmUgWW91cnNlbGYgLSBKdXN0aW4gQmllYmVyIiwiaWF0IjoxNzg4NDI1OTQxLCJleHAiOjE3ODg0Mjk1NDEsInVybCI6Ik5sQk5SRFo2TjBKU1ZrVnpWRU5CUkZJdlZuWllTRUZ3V1ZWTFRuRlpaWGt6VXpKQk5TdDRkV3hSV0RSa2EwOURWV0lyUldOSU1tUjJLemRDWm01MlVrZEJPRmhaY0dWT1NpdExhak0zWkVSRmVqQjBTV1ZoYVVVeVUxTXlXVWxCY3pocU9FdDVOVTFSZWxsclYyUnVaVGQ2ZVVodFkzZzFNVzVHVlZOVlUzUkRVRmRtYkRrNE5uTjBTVTh3VGtKRmF6ZFVTMlJOVjNWMWN6ZE9RVUZxVFZoNFdqSlVLM1ozYmtwWVVHNXhObW96UkRNM1JVNUljV1kwTldnd2RHZHNWbGRPU0hwemVIY3lhRTEwTkZCMlpVRlpORkk0VVZCYWRWY3JiSFZoWVRjd1IyMTVTR1pFYlZKSE9FYzVaMHhYSzBoa1dEUmhWVWM1UlV4YVYzWXlkWGRRWTNKRVYyVjRNemxaTWt4eWJEZFdNVXhCYmxWdU5XWkVNV1Z3TTB0UmFYSnJhMmwyUWtwUVdWUlNSelJtVERoS1ZrZzFhU3M0YjJ0SEx6QmlibkJZYTJsQlV6RlVRbVYwWXpsbFoxVmhOMjEwU1dsYVdTdEpRVFkwTDJOb00zTlFNMHRHVDNaMk5reFViM0YwYlhaQlJVUkJXazV2WnpsNVFVbEZlVGh3UkZwM01ISTBSak0zWjFwcFFreHdNRGhUTjIxak9HNHlVREZMWVdwQ09GcDBOM0ZzS3pBNVFrOWlXR3h4UTFjclIwY3dZbEJ3WjBvMk1sWjJVemwxYkN0UVdWYzBjVVZwYkcxVVltVnliVk5OUjJVeFYzVkhaamRXVXpaUFFUVlNhRWRCVWpWeUwyRkNZVFpvVVc0MVIzWlRkbEJoZVZnMmFUUllZMFJNWmpKYU5raHRaVlpCY0Vkc2EwVTFURVpSWldwSU1WbEZiVmdyTlhwUWNXbGtia2M1TVdscmQzWlhlRzVKUFE9PSJ9.Tnxr_NzerQej5jz9uWvQQ284HEW_h7EwBlMge7MIdow"
  }
}
*/