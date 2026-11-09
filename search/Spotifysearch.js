/*
# Scrape : Spotify Search
# Type : CJS
# Url : https://spotify.com
# Snippet : https://snippet.zellrayy.com/aE7BESmfzS
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/
const axios = require('axios')
const bearer = 'BQCyjxgvXA4KbMNSpp7C4jPwpdCfj7ttvA-dzgbS73KzI1VZ3MFMTPGFQX-4BwcTzBJbkHF7xaUy3TZfrbDeCrY2q1HizFia6VOV2Z1diw2Nucw5Ta7_Bd8fcHwyVKdGmWZbhPL2LdJC'
const client = 'AAGVWUGDbqu9Ja94LK01gSAyNDYO3k2yIm8WvpNapNQyO3tDBIvjFljyPO2/fKiarig1HVOkjG5Y4n9eWPiixcvdiksIGmMZWmWyWw5TAzbgaJO1p6rAOrpz+bAUkfRcecvGAK0+YMmVdA7YttWmzMd96UzTASN4hmbpWbTP08PBzTMXBGYZGFjM8ZE2Dplzymb9ufBYddJHmrQ52fl5tMmk3HWND7qKysyUckr/7Sa3z++cbbOnVqV+slno+he5qfDAepPqBAgX5Zj4Ub5uCkSkPQMaxY7oT16x2L0kiGCVvCEL/gw4DUUGjgYU228ukthYbSekSvc7zbByRe5Lza8cAK4RMks='


async function spotifySearch(query) {
  const { data } = await axios.post(
    'https://api-partner.spotify.com/pathfinder/v2/query',
    {
      variables: {
        query,
        numberOfTopResults: 20,
        includePreReleases: true,
        includeAlbumPreReleases: true
      },
      operationName: 'findTopResults',
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: '903df2a65d8121e27d73a2be03c01e88ebe6021bb6d4eb82a389e35d87e51d27'
        }
      }
    },
    {
      headers: {
        accept: 'application/json',
        'accept-language': 'id',
        authorization: `Bearer ${bearer}`,
        'client-token': client,
        'content-type': 'application/json;charset=UTF-8'
      }
    }
  )

  return data
}

try {
  const result = await spotifySearch('let me love you')

  const items = result?.data?.searchV2?.topResultsV2?.itemsV2 || []

  let txt = ''

  for (const x of items) {
    const track = x?.item?.data
    if (!track?.id || !track?.name || !track?.artists?.items) continue

    txt += `*Judul:* ${track.name}\n`
    txt += `*Artis:* ${track.artists.items
      .map(a => a?.profile?.name)
      .filter(Boolean)
      .join(', ')}\n`
    txt += `*Image:* ${track.albumOfTrack?.coverArt?.sources?.slice(-1)[0]?.url || '-'}\n`
    txt += `*URL:* https://open.spotify.com/track/${track.id}\n\n`
  }

  m.reply(txt || 'Tidak ada hasil.')
} catch (e) {
  m.reply(JSON.stringify(e.response?.data || { error: e.message }, null, 2))
}