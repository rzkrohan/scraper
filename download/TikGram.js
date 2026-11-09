/*
# Name : TikTok, Instagram Lookup
# Type : CJS
# Url : https://clipssaver.com
# Snippet : https://snippet.zellrayy.com/MmnAjE9nmn
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
# Group : https://chat.whatsapp.com/EHtylaWQFyW9hq8yVln3Lu
*/
// # TIKTOK
(async () => {
  const axios = require('axios');
  const username = 'iamrzk_'; // ganti username di sini

  try {
    const res = await axios.post(
      'https://clipssaver.com/api/tiktok/user-info',
      { username },
      { headers: { 'Accept': 'application/json, text/plain, */*', 'Content-Type': 'application/json' } }
    );
    const userInfo = res.data;

    if (!userInfo.success) return m.reply('❌ User tidak ditemukan.');

    const data = userInfo.data;
    const caption = `
👤 *${data.nickname}* (@${data.username})
🆔 UID: ${data.userId}
✅ Verified: ${data.verified ? 'Ya' : 'Tidak'}
📝 Bio: ${data.bio || '-'}
👥 Followers: ${data.stats.followers}
👣 Following: ${data.stats.following}
❤️ Likes: ${data.stats.likes}
🎬 Videos: ${data.stats.videos}
🔒 Private: ${data.privateAccount ? 'Ya' : 'Tidak'}
`.trim();

    await conn.sendMessage(m.chat, { image: { url: data.avatar }, caption }, { quoted: m });
  } catch (e) {
    m.reply(`❌ Error: ${e.response?.data?.message || e.message}`);
  }
})();

// # INSTAGRAM
(async () => {
  const axios = require('axios');
  const username = 'iamsrk'; // ganti username di sini

  try {
    const res = await axios.post(
      'https://clipssaver.com/api/instagram/instagramDownloader/profile',
      { username },
      { headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } }
    );
    const result = res.data;

    if (result.status !== 'success') return m.reply('❌ User tidak ditemukan.');

    const data = result.data.profile;
    const caption = `
👤 *${data.full_name}* (@${data.username})
🆔 ID: ${data.id}
✅ Verified: ${data.is_verified ? 'Ya' : 'Tidak'}
🔒 Private: ${data.is_private ? 'Ya' : 'Tidak'}
📝 Bio: ${data.biography || '-'}
🔗 Link: ${data.external_url || '-'}
👥 Followers: ${data.edge_followed_by.count}
👣 Following: ${data.edge_follow.count}
📸 Posts: ${data.edge_owner_to_timeline_media.count}
`.trim();

    await conn.sendMessage(m.chat, { image: { url: data.profile_pic_url_hd }, caption }, { quoted: m });
  } catch (e) {
    m.reply(`❌ Error: ${e.response?.data?.message || e.message}`);
  }
})();
