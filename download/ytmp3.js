// download-y2down-auto.js
const axios = require('axios');
const { createHash } = require('crypto');

// ==================== CONFIG ====================
const VIDEO_URL = 'https://www.youtube.com/watch?v=edsx_MOhVnk';
const FORMAT = 'mp3';

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36';

const commonHeaders = {
  accept: '*/*',
  'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  origin: 'https://y2down.cc',
  referer: 'https://y2down.cc/',
  'sec-ch-ua': '"Chromium";v="139", "Not;A=Brand";v="99"',
  'sec-ch-ua-mobile': '?1',
  'sec-ch-ua-platform': '"Android"',
  'user-agent': USER_AGENT,
};

// ==================== HELPERS ====================
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function sha256Hex(text) {
  return createHash('sha256').update(text).digest('hex');
}

/**
 * Algoritma resmi dari savenow-api.js:
 *   hash = sha256(salt + ":" + nonce)
 *   harus diawali "0" sebanyak difficulty
 */
async function solvePoW(salt, difficulty) {
  const prefix = '0'.repeat(Number(difficulty));
  let nonce = 0;

  while (true) {
    const hex = sha256Hex(String(salt) + ':' + String(nonce));
    if (hex.slice(0, difficulty) === prefix) {
      return nonce;
    }
    nonce++;
    // biar event loop tidak freeze
    if (nonce % 10000 === 0) await sleep(0);
  }
}

// ==================== AUTO GET API KEY ====================
async function getApiKey() {
  console.log('0. Ambil API Key terbaru...');
  const res = await axios.get('https://y2down.cc/js/shared/savenow-api.js', {
    headers: { 'user-agent': USER_AGENT, referer: 'https://y2down.cc/' },
    timeout: 15000,
  });

  const match = res.data.match(/DEFAULT_API_KEY\s*=\s*["']([a-zA-Z0-9]+)["']/);
  if (!match) throw new Error('DEFAULT_API_KEY tidak ditemukan');
  console.log('   API Key:', match[1]);
  return match[1];
}

// ==================== MAIN ====================
async function main() {
  try {
    const API_KEY = await getApiKey();

    // 1. Challenge
    console.log('1. Ambil PoW Challenge...');
    const challengeRes = await axios.get('https://p.savenow.to/api/pow/challenge', {
      headers: commonHeaders,
    });
    const { salt, difficulty, expires_at, signature } = challengeRes.data;
    console.log('   salt:', salt);
    console.log('   difficulty:', difficulty);

    // 2. Solve (dengan format salt:nonce)
    console.log('2. Solving PoW...');
    const nonce = await solvePoW(salt, difficulty);
    console.log('   Nonce ditemukan:', nonce);

    // 3. Verify
    console.log('3. Verify PoW...');
    const verifyRes = await axios.post(
      'https://p.savenow.to/api/pow/verify',
      {
        salt,
        difficulty,
        expires_at,
        signature,
        nonce,
      },
      {
        headers: {
          ...commonHeaders,
          'content-type': 'application/json',
          accept: 'application/json',
        },
      }
    );

    console.log('   Verify response:', verifyRes.data);

    if (!verifyRes.data?.success || !verifyRes.data?.token) {
      throw new Error('Verify gagal / token tidak ada');
    }

    const token = verifyRes.data.token;
    console.log('   Token OK');

    const authHeaders = {
      ...commonHeaders,
      authorization: `Bearer ${token}`,
    };

    // 4. Download request
    console.log('4. Request download...');
    const downloadUrl =
      `https://p.savenow.to/api/v2/download?format=${FORMAT}` +
      `&url=${encodeURIComponent(VIDEO_URL)}` +
      `&apikey=${API_KEY}`;

    const downloadRes = await axios.get(downloadUrl, { headers: authHeaders });
    console.log('   Download response:', downloadRes.data);

    const progressId =
      downloadRes.data?.id ||
      downloadRes.data?.progress_id ||
      downloadRes.data?.stream_id ||
      downloadRes.data?.download_id;

    if (!progressId) throw new Error('Progress ID tidak ditemukan');

    // 5. Polling
    console.log('5. Polling progress...', progressId);
    for (let i = 1; i <= 40; i++) {
      await sleep(1500);
      const prog = await axios.get(
        `https://p.savenow.to/api/progress?id=${progressId}`,
        { headers: authHeaders }
      );

      const d = prog.data;
      console.log(`   [${i}]`, d.status || d.state, d.progress ?? d.percent ?? '');

      if (d.status === 'ready' || d.status === 'completed' || d.url || d.download_url) {
        console.log('\n✅ SIAP DOWNLOAD!');
        console.log(JSON.stringify(d, null, 2));
        return;
      }
      if (d.status === 'error' || d.status === 'failed') {
        throw new Error('Download gagal: ' + JSON.stringify(d));
      }
    }

    console.log('Timeout menunggu progress.');
  } catch (err) {
    if (err.response) {
      console.error('❌ HTTP', err.response.status);
      console.error(err.response.data);
    } else {
      console.error('❌ Error:', err.message);
    }
  }
}

main();