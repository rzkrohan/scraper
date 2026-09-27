/*
# Name : Pinterest Download (Support Carousel)
# Type : CJS
# Url : https://pintsave.net
# Snippet : https://snippet.zellrayy.com/qF7waW22gK
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/
const axios = require('axios');

(async () => {
  const body = new URLSearchParams();
  body.append('url', 'https://pin.it/7JCAkz6RE');

  const { data } = await axios.post(
    'https://pintsave.net/api/fetch-media',
    body.toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': '*/*',
        'X-Requested-With': 'XMLHttpRequest'
      }
    }
  );

  m.reply(JSON.stringify(data, null, 2));
})();