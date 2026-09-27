/*
# Name : YouTube Download MP3/MP4 (FAST RESPON)
# Type : CJS
# Url : https://scriptmind(.)co
# Snippet : https://snippet.zellrayy.com/fMVzbr7rz8
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/
const axios = require('axios');
const crypto = require('crypto');

async function resolvePreview(url) {
    try {
        const guestId = crypto.randomUUID();

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
        );

        return response.data;
    } catch (error) {
        return {
            success: false,
            message:
                error.response?.data?.message ||
                error.response?.data ||
                error.message
        };
    }
}

(async () => {
    const result = await resolvePreview(
        'https://youtu.be/ObuP-wH0ghA?si=pwdwhVr8cZLBgXAh'
    );

    console.log(JSON.stringify(result, null, 2));

    if (result.success) {
        const data = result.result;

        console.log('Title:', data.title);
        console.log('Duration:', data.duration);
        console.log('Preview URL:', data.previewUrl);
        console.log('Canonical URL:', data.canonicalUrl);
        console.log('Media API Token:', data.mediaApiToken);

        const resolvedMedia = JSON.parse(data.resolvedMediaJson);

        console.log('Resolved Media:', resolvedMedia);
    }
})();