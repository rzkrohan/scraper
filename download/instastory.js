/*
# Name : Instagram Story Download
# Type : CJS
# Url : https://snapinsta.im
# Snippet : https://snippet.zellrayy.com/cL2NcT2PAA
# Source : https://whatsapp.com/channel/0029VbDWBmtA89MamPba8q3f
*/

const axios = require('axios')
const cheerio = require('cheerio')

async function snapinsta(username) {
  try {
    const body = new URLSearchParams({
      url: username,
      scope: 'storyDownloader',
      locale: 'id',
      viewerVersion: 'profile-r3'
    })

    const { data: html } = await axios.post(
      'https://snapinsta.im/process',
      body.toString(),
      {
        headers: {
          accept: '*/*',
          'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
          origin: 'https://snapinsta.im',
          referer: 'https://snapinsta.im/',
          'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
          'x-requested-with': 'XMLHttpRequest'
        },
        timeout: 30000
      }
    )

    const $ = cheerio.load(html)

    const result = {
      username: $('.snap-viewer').attr('data-viewer-username') || null,
      session: $('.snap-viewer').attr('data-viewer-session') || null,
      profile: {
        name: $('.snap-profile h2').first().text().trim() || null,
        username: $('.premium-eyebrow').first().text().trim() || null,
        bio: $('.snap-bio-text').first().text().trim() || null,
        followers: $('.snap-profile-stats span').eq(0).find('strong').text().trim() || null,
        following: $('.snap-profile-stats span').eq(1).find('strong').text().trim() || null,
        image: $('.snap-profile > img').first().attr('src') || null,
        download: $('.snap-profile-actions a.download-media').first().attr('href') || null
      },
      highlights: [],
      stories: [],
      posts: []
    }

    $('.snap-profile-highlight').each((i, el) => {
      const item = $(el)

      result.highlights.push({
        id: item.attr('data-highlight-id') || null,
        title: item.find('span').text().trim() || null,
        image: item.find('img').attr('src') || null
      })
    })

    $('[data-profile-section="stories"] .snap-profile-group').each((i, el) => {
      const group = $(el)

      group.find('.snap-profile-card').each((j, card) => {
        const item = $(card)
        const media = item.find('.snap-open-media')

        result.stories.push({
          group: group.attr('data-profile-group') || null,
          type: media.attr('data-profile-play') || null,
          media: media.attr('data-playback-url') || null,
          thumbnail: media.find('img').attr('src') || null,
          download: item.find('a.download-media').attr('href') || null,
          mediaToken: item.find('.snap-media-options').attr('data-media-token') || null
        })
      })
    })

    $('[data-profile-section="posts"] .snap-profile-group').each((i, el) => {
      const group = $(el)

      const post = {
        id: group.attr('data-profile-group') || null,
        caption: group.find('.snap-post-caption').first().text().trim() || null,
        media: []
      }

      group.find('.snap-profile-card').each((j, card) => {
        const item = $(card)
        const media = item.find('.snap-open-media')

        post.media.push({
          type: media.attr('data-profile-play') || null,
          media: media.attr('data-playback-url') || null,
          thumbnail: media.find('img').attr('src') || null,
          download: item.find('a.download-media').attr('href') || null,
          mediaToken: item.find('.snap-media-options').attr('data-media-token') || null
        })
      })

      result.posts.push(post)
    })

    return result
  } catch (e) {
    return {
      status: false,
      message: e.response?.data
        ? typeof e.response.data === 'string'
          ? e.response.data
          : JSON.stringify(e.response.data)
        : e.message
    }
  }
}

async function main() {
  try {
    const result = await snapinsta('jonathan.henrich')
    await m.reply(JSON.stringify(result, null, 2))
  } catch (e) {
    await m.reply(`❌ Error: ${e.message}`)
  }
}

main()