const axios = require('axios')
const crypto = require('crypto')
const { Innertube } = require('youtubei.js')

async function resolvePreview(url) {
    try {
        const guestId = crypto.randomUUID()

        const response = await axios.post(
            'https://scriptmind.co/api/media/resolve/preview',
            {
                url,
                platform: 'youtube',
                pageType: 'video',
                guestId
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            }
        )

        return response.data
    } catch (error) {
        return {
            success: false,
            message:
                error.response?.data?.message ||
                error.message ||
                'Gagal resolve video'
        }
    }
}

async function YouTubeplay(query) {
    try {
        if (!query || typeof query !== 'string') {
            return {
                success: false,
                message: 'Query harus berupa teks'
            }
        }

        const youtube = await Innertube.create()

        const search = await youtube.search(query, {
            type: 'video'
        })

        const video = search.videos?.[0]

        if (!video) {
            return {
                success: false,
                message: 'Video tidak ditemukan'
            }
        }

        const videoId = video.id

        if (!videoId) {
            return {
                success: false,
                message: 'Video ID tidak ditemukan'
            }
        }

        const url = `https://www.youtube.com/watch?v=${videoId}`

        const resolved = await resolvePreview(url)

        if (!resolved?.success) {
            return {
                success: false,
                message: resolved?.message || 'Gagal resolve video'
            }
        }

        const data = resolved.result || {}

        let media = null

        try {
            if (data.resolvedMediaJson) {
                media =
                    typeof data.resolvedMediaJson === 'string'
                        ? JSON.parse(data.resolvedMediaJson)
                        : data.resolvedMediaJson
            }
        } catch {
            media = null
        }

        return {
            success: true,
            result: {
                title:
                    data.title ||
                    video.title?.text ||
                    String(video.title || ''),

                videoId,

                url: data.canonicalUrl || url,

                thumbnail:
                    data.thumbnailUrl ||
                    video.thumbnails?.[0]?.url ||
                    null,

                duration:
                    data.duration ||
                    video.duration?.text ||
                    video.duration?.seconds ||
                    null,

                previewUrl: data.previewUrl || null,

                mediaApiToken: data.mediaApiToken || null,

                resolvedMedia: media,

                raw: data
            }
        }
    } catch (error) {
        return {
            success: false,
            message: error.message || 'Terjadi kesalahan'
        }
    }
}

async function main() {
    const result = await YouTubeplay('the one that got away')

    if (!result.success) {
        console.log(result.message)
        return
    }

    console.log('Title:', result.result.title)
    console.log('URL:', result.result.url)
    console.log('Duration:', result.result.duration)
    console.log('Preview:', result.result.previewUrl)
    console.log('Media:', result.result.resolvedMedia)
}

main()