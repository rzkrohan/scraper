/*
# Scrape : Alight Motion Prem yang lagi Ngetrend
# Type : CJS
# Url : https://dapjimotionpro.my.id
# Snippet : https://snippet.zellrayy.com/f9zbK84sYG
# Password : rohancakep
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/
const axios = require('axios')

const url = 'https://dapjimotionpro.my.id/api/proxy-amprem'

async function sendLink(email) {
  const { data } = await axios.post(url, {
    action: 'send',
    email
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

  return data
}

async function verifyLink(email, link) {
  const { data } = await axios.post(url, {
    action: 'verify',
    email,
    link
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

  return data
}

async function main() {
  const email = 'rohan@gmail.com'

  const send = await sendLink(email)
  console.log(send)

  const link = 'https://alight-creative.firebaseapp.com'

  const verify = await verifyLink(email, link)
  console.log(verify)
}

main().catch(err => {
  console.error(err.response?.data || err.message)
})