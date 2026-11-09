/*
# Name : Deepseek Ai V4 Flash 
# Type : CJS
# Url : https://deep-seek.ai
# Snippet : https://snippet.zellrayy.com/JAbbmNaAg6
# Source : https://whatsapp.com/channel/0029VbDWBmtA89MamPba8q3f
*/

 const axios = require('axios');

const BASE_URL = 'https://deep-seek.ai';

const headers = {
  Accept: '*/*',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  'Content-Type': 'application/json',
  Origin: BASE_URL,
  Referer: `${BASE_URL}/chat`,
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
  'sec-ch-ua': '"Chromium";v="139", "Not;A=Brand";v="99"',
  'sec-ch-ua-mobile': '?1',
  'sec-ch-ua-platform': '"Android"'
};

const getCookies = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/chat`, {
      headers,
      maxRedirects: 5,
      timeout: 30000
    });

    const cookies = {};

    for (const item of response.headers['set-cookie'] || []) {
      const cookie = item.split(';')[0];
      const index = cookie.indexOf('=');

      if (index !== -1) {
        cookies[cookie.slice(0, index)] = cookie.slice(index + 1);
      }
    }

    const html = typeof response.data === 'string' ? response.data : '';

    const csrfMatch =
      html.match(/name="csrf-token"\s+content="([^"]+)"/i) ||
      html.match(/name="_token"\s+content="([^"]+)"/i);

    return {
      cookies,
      csrf: csrfMatch?.[1] || cookies['XSRF-TOKEN'] || null
    };
  } catch (error) {
    return {
      error: true,
      message: error.response?.data || error.message
    };
  }
};

const chat = async (prompt, messages = []) => {
  try {
    const session = await getCookies();

    if (session.error) return session;

    const cookie = Object.entries(session.cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');

    const response = await axios.post(
      `${BASE_URL}/api/chat`,
      {
        model: 'deepseek/deepseek-v4-flash',
        messages: [
          ...messages,
          {
            role: 'user',
            content: prompt
          }
        ]
      },
      {
        headers: {
          ...headers,
          Cookie: cookie,
          ...(session.csrf
            ? {
                'X-CSRF-TOKEN': session.csrf,
                'X-XSRF-TOKEN': session.csrf
              }
            : {})
        },
        responseType: 'text',
        timeout: 120000
      }
    );

    const raw = response.data;
    let result = '';
    let usage = null;

    for (const line of raw.split(/\r?\n/)) {
      if (!line.startsWith('data:')) continue;

      const value = line.slice(5).trim();

      if (!value || value === '[DONE]') continue;

      try {
        const json = JSON.parse(value);
        const choice = json.choices?.[0];

        if (choice?.delta?.content) {
          result += choice.delta.content;
        }

        if (json.usage) {
          usage = json.usage;
        }
      } catch {}
    }

    return {
      success: true,
      model: 'deepseek/deepseek-v4-flash',
      result,
      usage
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || null,
      error: error.response?.data || error.message
    };
  }
};

try {
  const response = await chat('siapa kamu?');

  if (!response.success) {
    await m.reply(JSON.stringify(response, null, 2));
  } else {
    await m.reply(response.result || 'Tidak ada respons dari AI.');
  }
} catch (error) {
  await m.reply(`Error: ${error.message}`);
}