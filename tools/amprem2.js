/*
# Name : Alight Motion Prem V2
# Type : CJS
# Url : https://am.neonode(.)my.id
# Snippet : https://snippet.zellrayy.com/VZv5kvbLKg
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/
const axios = require('axios')
const readline = require('readline')

const API_URL = 'https://am.neonode.my.id/api'

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const question = text =>
    new Promise(resolve => rl.question(text, resolve))

async function sendLink(email) {
    try {
        const { data } = await axios.post(
            `${API_URL}/send-link`,
            { email },
            {
                headers: {
                    'content-type': 'application/json'
                }
            }
        )

        return data
    } catch (error) {
        return error.response?.data || {
            success: false,
            message: error.message
        }
    }
}

async function verifyLink(email, magicLink) {
    try {
        const { data } = await axios.post(
            `${API_URL}/verify-link`,
            {
                email,
                magicLink
            },
            {
                headers: {
                    'content-type': 'application/json'
                }
            }
        )

        return data
    } catch (error) {
        return error.response?.data || {
            success: false,
            message: error.message
        }
    }
}

async function main() {
    try {
        const email = (
            await question('Masukkan email: ')
        ).trim()

        if (!email) {
            console.log('Email tidak boleh kosong.')
            return
        }

        console.log('\nMengirim magic link...')

        const send = await sendLink(email)

        console.log(send)

        if (!send.success) return

        console.log('\nCek inbox atau spam email.')
        console.log('Salin magic link yang diterima.\n')

        const magicLink = (
            await question('Masukkan magic link: ')
        ).trim()

        if (!magicLink) {
            console.log('Magic link tidak boleh kosong.')
            return
        }

        console.log('\nMemverifikasi magic link...')

        const verify = await verifyLink(
            email,
            magicLink
        )

        console.log('\nHasil:')
        console.log(JSON.stringify(verify, null, 2))

    } finally {
        rl.close()
    }
}

main()