/*
# Scrape : Anime Play (anime, search, detail, watch)
# Type : ESM
# Url : https://wotanime.my.id
# Snippet : https://snippet.zellrayy.com/8sYYc374j7
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/
import axios from 'axios'

const BASE_URL = 'https://wotanime.my.id/api/animeplay'

const TOKEN = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJnb29nbGVJZCI6ImFub25fNmJmM2RlYmMxYzY2OGI0YWIzOWVlZjNmIiwiZW1haWwiOiI2YmYzZGViYzFjNjY4YjRhYjM5ZWVmM2ZAd290YW5pbWUubG9jYWwiLCJuYW1lIjoiVGFtdS1nMm5paHMiLCJhdmF0YXIiOiIiLCJpYXQiOjE3ODYzMjg0MzQsImV4cCI6MTc4ODkyMDQzNH0.jlxh8dTmeH7r_lAvUtqd0YZcFINsnxd1jTHBq8prFGA'

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
        Authorization: TOKEN,
        Accept: 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/131.0.0.0 Mobile Safari/537.36',
        Referer: 'https://wotanime.my.id/',
        Origin: 'https://wotanime.my.id'
    }
})

async function search(query, page = 1) {
    const { data } = await api.get('/search', {
        params: {
            q: query,
            page
        }
    })

    return {
        status: data.status === 'success',
        query,
        page,
        hasNextPage: data.data?.hasNextPage || false,
        results: data.data?.data || []
    }
}

async function detail(id) {
    const { data } = await api.get(
        `/detail/${encodeURIComponent(id)}`
    )

    const anime = data.data?.data

    if (!anime) {
        throw new Error('Anime tidak ditemukan')
    }

    return {
        status: true,
        id: anime.id,
        title: anime.title,
        image_url: anime.image_url,
        synopsis: anime.synopsis,
        type: anime.type,
        total_episode: anime.total_episode,
        status_anime: anime.status,
        duration: anime.duration,
        studio: anime.studio?.name || null,
        genres: (anime.genres || [])
            .map(x => ({
                name: x.genre?.name,
                slug: x.genre?.slug
            }))
            .filter(x => x.name),
        episodes: (anime.episodes || []).map(ep => ({
            id: ep.id,
            title: ep.title_indonesian,
            number: ep.number,
            date_created: ep.date_created
        })),
        recommendations: anime.recommendations || []
    }
}

async function watch(episodeId) {
    const { data } = await api.get(
        `/watch/${encodeURIComponent(episodeId)}`
    )

    const result = data.data

    return {
        status: true,
        seriesSlug: result?.seriesSlug,
        streams: (result?.data || []).map(item => ({
            id: item.id,
            quality: item.quality,
            streaming_url: item.streaming_url?.startsWith('//')
                ? `https:${item.streaming_url}`
                : item.streaming_url,
            download_url: item.download_url?.startsWith('//')
                ? `https:${item.download_url}`
                : item.download_url,
            file_size: item.file_size
        }))
    }
}

async function anime(query, page = 1) {
    const result = await search(query, page)

    return result
}

export {
    search,
    detail,
    watch,
    anime
}