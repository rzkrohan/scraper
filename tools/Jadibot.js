const axios = require('axios')

async function jadibotScrape(number) {
  number = String(number).replace(/\D/g, '')

  if (!number.startsWith('62')) {
    throw new Error('Nomor harus diawali 62')
  }

  const result = {
    jawadtech: {
      number,
      code: null
    },
    khanmd: {
      number,
      code: null
    }
  }

  await Promise.all([
    (async () => {
      try {
        const { data } = await axios.post(
          'https://jawadtech.vercel.app/x',
          {
            a: 'gen',
            b: {
              server: 'server100',
              number
            }
          },
          {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 15000
          }
        )

        result.jawadtech.code = data?.c || null
      } catch (e) {
        result.jawadtech.error = e.response?.data || e.message
      }
    })(),

    (async () => {
      try {
        const { data } = await axios.get(
          'https://khanmd-pairx.onrender.com/pair',
          {
            params: { number },
            headers: {
              Accept: 'application/json, text/plain, */*'
            },
            timeout: 15000
          }
        )

        result.khanmd.code = data?.code || null
      } catch (e) {
        result.khanmd.error = e.response?.data || e.message
      }
    })()
  ])

  return result
}

async function main() {
  try {
    const result = await jadibotScrape('62xxxxx')
    console.log(JSON.stringify(result, null, 2))
  } catch (e) {
    console.error(e.message)
  }
}

main()