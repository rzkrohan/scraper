/*
# Name : Temporary Gmail (Google Mail)
# Type : CJS
# Url : https://temp.tf
# Snippet : https://snippet.zellrayy.com/EBWxvRGdUD
# Source : https://whatsapp.com/channel/0029VbDWBmtA89MamPba8q3f
*/

// CREATE NEW GMAIL
const axios = require('axios');

try {
    const { data } = await axios.get('https://temp.tf/api/account', {
        params: {
            providers: 'gmail',
            dot: 1,
            plus: 1
        },
        headers: {
            Accept: 'application/json'
        }
    });

    await m.reply(JSON.stringify(data, null, 2));
} catch (e) {
    await m.reply(JSON.stringify({
        status: e.response?.status || 500,
        error: e.response?.data || e.message
    }, null, 2));
}

// UNTUK CHECK PESAN
const axios = require('axios');

try {
    const email = 'm.a.n.s.u.r.ku.r.t.a.r.a.n.5+t7bo42n24o@gmail.com';

    const { data } = await axios.post(
        'https://temp.tf/api/check',
        {
            email,
            wait: true
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }
    );

    await m.reply(JSON.stringify(data, null, 2));
} catch (e) {
    await m.reply(JSON.stringify({
        status: e.response?.status || 500,
        error: e.response?.data || e.message
    }, null, 2));
}