/*
# Scrape : Ai yang kata nya Anak claude😂
# Type : CJS
# Url : https://ai.zervida.my.id
# Snippet : https://snippet.zellrayy.com/PfU77QCt9L
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/
const axios = require('axios')
const fs = require('fs')
const path = require('path')

const BASE_URL = 'https://ai.zervida.my.id'

function randomDigits(length = 6) {
  let result = ''

  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10)
  }

  return result
}

function randomUsername(prefix = 'user') {
  const randomPart = Math.random()
    .toString(36)
    .substring(2, 8)

  return `${prefix}_${randomPart}`
}

async function signup(username, password) {
  const res = await axios.post(
    `${BASE_URL}/auth/signup`,
    {
      username,
      password
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )

  return res.data
}

async function createRoom(name, token) {
  const res = await axios.post(
    `${BASE_URL}/rooms`,
    {
      name
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }
  )

  return res.data
}

function readAttachment(filePath) {
  const content = fs.readFileSync(filePath)

  return {
    name: path.basename(filePath),
    content: content.toString('base64')
  }
}

function prepareMessage(message, filePath) {
  if (!filePath) {
    return message
  }

  const absolutePath = path.resolve(filePath)

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File tidak ditemukan: ${filePath}`)
  }

  const stat = fs.statSync(absolutePath)

  if (!stat.isFile()) {
    throw new Error(`Path bukan file: ${filePath}`)
  }

  const fileName = path.basename(absolutePath)
  const fileContent = fs.readFileSync(
    absolutePath,
    'utf8'
  )

  return `${message}

File yang dilampirkan:
${fileName}

Isi file:
\`\`\`
${fileContent}
\`\`\`

Gunakan isi file di atas untuk menjawab permintaan saya. Jangan meminta saya menyebutkan nama atau path file lagi karena isi file sudah diberikan.`
}

async function sendMessageStream(
  roomId,
  message,
  token,
  onEvent,
  attachments = []
) {
  const attachmentPayload = attachments.map(
    filePath => readAttachment(filePath)
  )

  const res = await axios.post(
    `${BASE_URL}/rooms/${roomId}/messages/stream`,
    {
      message,
      ...(attachmentPayload.length
        ? {
            attachments: attachmentPayload
          }
        : {})
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      responseType: 'stream'
    }
  )

  return new Promise((resolve, reject) => {
    let buffer = ''
    let finalPayload = null

    res.data.on('data', chunk => {
      buffer += chunk.toString('utf8')

      const parts = buffer.split(/\r?\n\r?\n/)
      buffer = parts.pop() || ''

      for (const part of parts) {
        const lines = part.split(/\r?\n/)

        for (const rawLine of lines) {
          const line = rawLine.trim()

          if (!line.startsWith('data:')) {
            continue
          }

          const dataStr = line
            .slice(5)
            .trim()

          if (!dataStr || dataStr === '[DONE]') {
            continue
          }

          try {
            const eventObj = JSON.parse(dataStr)

            if (eventObj.type === 'done') {
              finalPayload = eventObj
            }

            if (typeof onEvent === 'function') {
              onEvent(eventObj)
            }
          } catch {}
        }
      }
    })

    res.data.on('end', () => {
      resolve(finalPayload)
    })

    res.data.on('error', err => {
      reject(err)
    })
  })
}

async function main() {
  const message = process.argv[2]
  const filePath = process.argv[3]

  if (!message) {
    process.exit(1)
  }

  if (
    filePath &&
    !fs.existsSync(path.resolve(filePath))
  ) {
    console.error(
      `File tidak ditemukan: ${filePath}`
    )
    process.exit(1)
  }

  const username = randomUsername()
  const password = randomDigits(6)

  const signupData = await signup(
    username,
    password
  )

  const token = signupData.token

  if (!token) {
    throw new Error(
      'Token tidak ditemukan'
    )
  }

  const roomData = await createRoom(
    'New conversation',
    token
  )

  if (!roomData.id) {
    throw new Error(
      'Room ID tidak ditemukan'
    )
  }

  const finalMessage = prepareMessage(
    message,
    filePath
  )

  const attachments = filePath
    ? [path.resolve(filePath)]
    : []

  process.stdout.write('Mengirim pesan...\n\n')

  await sendMessageStream(
    roomData.id,
    finalMessage,
    token,
    evt => {
      if (evt.type === 'text_delta') {
        process.stdout.write(
          evt.content || ''
        )
      }
    },
    attachments
  )

  process.stdout.write('\n')
}

main().catch(err => {
  if (err.response) {
    let data = err.response.data

    if (
      data &&
      typeof data.on === 'function'
    ) {
      data = ''
    }

    if (
      data &&
      typeof data === 'object'
    ) {
      try {
        data = JSON.stringify(data)
      } catch {
        data = ''
      }
    }

    console.error(
      `Error: ${err.response.status}${data ? ` ${data}` : ''}`
    )
  } else {
    console.error(
      `Error: ${err.message}`
    )
  }

  process.exit(1)
})

module.exports = {
  signup,
  createRoom,
  sendMessageStream,
  readAttachment,
  randomDigits,
  randomUsername,
  prepareMessage
}