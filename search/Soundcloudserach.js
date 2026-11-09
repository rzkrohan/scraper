/*
# Scrape : SoundCloud Search
# Type : CJS
# Url : https://m.soundcloud.com
# Snippet : https://snippet.zellrayy.com/uwNJE6BemJ
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/
const axios = require('axios')

async function searchSoundCloud(query) {
  const { data } = await axios.get('https://api-mobi.soundcloud.com/search', {
    params: {
      q: query,
      client_id: 'KKzJxmw11tYpCs6T24P4uUYhqmjalG6M',
      stage: ''
    },
    headers: {
      Accept: 'application/json, text/javascript, */*; q=0.1',
      'Content-Type': 'application/json'
    }
  })

  return data
}

const query = 'company' // judul ny
const data = await searchSoundCloud(query)

let txt = `*Total Hasil:* ${data.total_results}\n`
txt += `*Jumlah Collection:* ${data.collection.length}\n\n`

for (const item of data.collection) {
  if (item.kind === 'track') {
    txt += `🎵 *${item.title}*\n${item.permalink_url}\n\n`
  } else if (item.kind === 'playlist') {
    txt += `📁 *${item.title}*\n${item.permalink_url}\n\n`
  }
}

m.reply(txt)