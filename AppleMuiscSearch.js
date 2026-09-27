/*
# Scrape : Apple Muisc Search
# Type : CJS
# Url : https://music.apple.com
# Snippet : https://snippet.zellrayy.com/D8b2DvuYhb
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/
const axios = require('axios');

let cachedToken = null;
let cachedTokenExp = 0;

async function getAppleMusicToken() {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedTokenExp - now > 60) {
    return cachedToken;
  }

  const homepage = await axios.get('https://music.apple.com/id/browse');
  const html = homepage.data;

  const jsMatch = html.match(/(?:src|href)="([^"]*\/assets\/index-[^"]+\.js)"/);
  if (!jsMatch) {
    throw new Error('Gagal menemukan bundle JS index-*.js di halaman music.apple.com');
  }

  const jsUrl = jsMatch[1].startsWith('http')
    ? jsMatch[1]
    : `https://music.apple.com${jsMatch[1]}`;

  const jsResponse = await axios.get(jsUrl);
  const jsContent = jsResponse.data;

  const tokenMatch = jsContent.match(/"(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)"/);
  if (!tokenMatch) {
    throw new Error('Gagal menemukan token di dalam bundle JS');
  }

  const token = tokenMatch[1];
  const payloadBase64 = token.split('.')[1];
  const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));

  cachedToken = token;
  cachedTokenExp = payload.exp;

  return token;
}

async function searchSuggestionsRaw(term, storefront = 'id') {
  const token = await getAppleMusicToken();
  const url = `https://amp-api-edge.music.apple.com/v1/catalog/${storefront}/search/suggestions`;

  const params = {
    'art[url]': 'f',
    'fields[albums]': 'artistName,artwork,contentRating,name,playParams,url',
    'fields[artists]': 'url,name,artwork',
    'format[resources]': 'map',
    kinds: 'terms,topResults',
    l: 'en-GB',
    'limit[results:terms]': 5,
    'limit[results:topResults]': 10,
    'omit[resource]': 'autos',
    platform: 'web',
    term: term,
    types: 'activities,albums,artists,editorial-items,music-movies,music-videos,playlists,record-labels,songs,stations,tv-episodes',
    with: 'naturalLanguage'
  };

  const headers = {
    origin: 'https://amp.apple.com',
    authorization: `Bearer ${token}`,
    'x-apple-client-version': '2632.4.0-external'
  };

  const response = await axios.get(url, { params, headers });
  return response.data;
}

function resolveResource(resources, type, id) {
  if (!resources || !resources[type] || !resources[type][id]) return null;
  return resources[type][id];
}

function summarizeItem(item, resources) {
  if (!item) return null;
  const { type, id } = item;
  const resource = resolveResource(resources, type, id);
  if (!resource) return { type, id, title: '(data tidak ditemukan)' };

  const attrs = resource.attributes || {};

  const base = {
    type,
    id,
    title: attrs.name || '(tanpa judul)',
  };

  if (type === 'songs' || type === 'music-videos') {
    base.artist = attrs.artistName;
    base.album = attrs.albumName;
    base.url = attrs.url;
  } else if (type === 'albums') {
    base.artist = attrs.artistName;
    base.releaseDate = attrs.releaseDate;
    base.url = attrs.url;
  } else if (type === 'artists') {
    base.url = attrs.url;
  } else if (type === 'playlists') {
    base.curator = attrs.curatorName;
    base.url = attrs.url;
  } else {
    base.url = attrs.url;
  }

  return base;
}

async function searchSuggestions(term, storefront = 'id') {
  const data = await searchSuggestionsRaw(term, storefront);
  const suggestions = data.results?.suggestions || [];
  const resources = data.resources || {};

  const terms = [];
  const topResults = [];

  for (const item of suggestions) {
    if (item.kind === 'terms') {
      terms.push(item.displayTerm || item.searchTerm);
    } else if (item.kind === 'topResults') {
      const summary = summarizeItem(item.content, resources);
      if (summary) topResults.push(summary);
    }
  }

  return { term, terms, topResults };
}

function printSuggestions(result) {
  console.log(`\nSaran pencarian untuk: "${result.term}"\n`);

  console.log('Kata kunci terkait:');
  if (result.terms.length === 0) {
    console.log('  (tidak ada)');
  } else {
    result.terms.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));
  }

  console.log('\nHasil teratas:');
  if (result.topResults.length === 0) {
    console.log('  (tidak ada)');
  } else {
    result.topResults.forEach((r, i) => {
      console.log(`  ${i + 1}. [${r.type}] ${r.title}${r.artist ? ' - ' + r.artist : ''}`);
      if (r.url) console.log(`     ${r.url}`);
    });
  }
  console.log('');
}

(async () => {
  try {
    const result = await searchSuggestions('let me love you');
    printSuggestions(result);
  } catch (err) {
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
})();

module.exports = { getAppleMusicToken, searchSuggestions, searchSuggestionsRaw };