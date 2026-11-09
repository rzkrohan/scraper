 /*
# Name : Audio converter
# Type : ESM
# Url : Gada lah peak
# Snippet : https://snippet.zellrayy.com/DavTL9WNqk
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/

/*
Effect:
bass
blown
deep
earrape
fast
fat
nightcore
reverse
robot
slow
smooth
tupai
verb
novocal
vocal
hdvocal
3dsound
radio
slowverb
cut
*/

import fs from 'fs'
import { exec } from 'child_process'
import { tmpdir } from 'os'
import path from 'path'

const effects = {
  bass: '-af "equalizer=f=54:width_type=o:width=2:g=20"',
  blown: '-af "acrusher=.1:1:64:0:log"',
  deep: '-af "atempo=4/4,asetrate=44500*2/3"',
  earrape: '-af "volume=12"',
  fast: '-filter:a "atempo=1.63,asetrate=44100"',
  fat: '-filter:a "atempo=1.6,asetrate=22100"',
  nightcore: '-af "atempo=1.06,asetrate=44100*1.25"',
  reverse: '-filter_complex "areverse"',
  robot:
    '-filter_complex "afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75"',
  slow: '-filter:a "atempo=0.7,asetrate=44100"',
  smooth:
    '-filter:v "minterpolate=\'mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=120\'"',
  tupai: '-filter:a "atempo=0.5,asetrate=65100"',
  verb: '-af "aecho=0.8:0.88:80:0.4"',

  novocal:
    '-af "pan=stereo|c0=c0-c1|c1=c1-c0"',

  vocal:
    '-af "pan=stereo|c0=0.5*c0+0.5*c1|c1=0.5*c0+0.5*c1,highpass=f=120,lowpass=f=12000,equalizer=f=250:width_type=o:width=2:g=-8,equalizer=f=500:width_type=o:width=2:g=3"',

  hdvocal:
    '-af "pan=stereo|c0=0.5*c0+0.5*c1|c1=0.5*c0+0.5*c1,highpass=f=100,lowpass=f=14000,equalizer=f=180:width_type=o:width=2:g=-10,equalizer=f=300:width_type=o:width=2:g=-4,equalizer=f=1200:width_type=o:width=2:g=5,equalizer=f=2500:width_type=o:width=2:g=7,equalizer=f=4500:width_type=o:width=2:g=5,volume=1.6"',

  '3dsound':
    '-af "apulsator=hz=0.25:width=1:mode=sine"',

  radio:
    '-af "highpass=f=300,lowpass=f=3500,acrusher=bits=8:mix=0.35,volume=1.5"'
}

function getRandom(ext) {
  return path.join(
    tmpdir(),
    `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
  )
}

function parseTime(value) {
  value = String(value).trim()

  if (/^\d+(?:\.\d+)?$/.test(value)) {
    return Number(value)
  }

  const parts = value.split(':')

  if (parts.length === 2) {
    const minutes = Number(parts[0])
    const seconds = Number(parts[1])

    if (
      !Number.isFinite(minutes) ||
      !Number.isFinite(seconds) ||
      seconds >= 60
    ) {
      return null
    }

    return minutes * 60 + seconds
  }

  if (parts.length === 3) {
    const hours = Number(parts[0])
    const minutes = Number(parts[1])
    const seconds = Number(parts[2])

    if (
      !Number.isFinite(hours) ||
      !Number.isFinite(minutes) ||
      !Number.isFinite(seconds) ||
      minutes >= 60 ||
      seconds >= 60
    ) {
      return null
    }

    return hours * 3600 + minutes * 60 + seconds
  }

  return null
}

async function convert(filePath, effect, ...args) {
  const output = getRandom('.mp3')

  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File tidak ditemukan: ${filePath}`)
    }

    let filter

    if (effect === 'slowverb') {
      const speed = Number(args[0])

      if (
        !Number.isFinite(speed) ||
        speed <= 0 ||
        speed > 5
      ) {
        throw new Error(
          'Format slowverb: convert(path, "slowverb", speed)'
        )
      }

      const pitchRate = Math.round(44100 * speed)

      filter =
        `-filter_complex "asetrate=${pitchRate},aresample=44100,aecho=0.8:0.88:80:0.4"`
    }

    else if (effect === 'cut') {
      const start = parseTime(args[0])
      const end = parseTime(args[1])

      if (
        start === null ||
        end === null ||
        start < 0 ||
        end <= start
      ) {
        throw new Error(
          'Format cut: convert(path, "cut", start, end)'
        )
      }

      filter = `-ss ${start} -t ${end - start} -vn`
    }

    else {
      filter = effects[effect]

      if (!filter) {
        throw new Error(`Effect "${effect}" tidak tersedia`)
      }
    }

    await new Promise((resolve, reject) => {
      exec(
        `ffmpeg -y -i "${filePath}" ${filter} -codec:a libmp3lame -b:a 192k "${output}"`,
        {
          maxBuffer: 1024 * 1024 * 10
        },
        err => {
          if (err) return reject(err)
          resolve()
        }
      )
    })

    return output

  } catch (err) {
    try {
      fs.unlinkSync(output)
    } catch {}

    throw err
  }
}

export {
  effects,
  convert
}


// EXAMPLE

const input = '/tmp/audio.mp3'

// Bass
const bass = await convert(input, 'bass')
console.log('Bass:', bass)

// Nightcore
const nightcore = await convert(input, 'nightcore')
console.log('Nightcore:', nightcore)

// Vocal
const vocal = await convert(input, 'vocal')
console.log('Vocal:', vocal)

// HD Vocal
const hdvocal = await convert(input, 'hdvocal')
console.log('HD Vocal:', hdvocal)

// 3D Sound
const sound3d = await convert(input, '3dsound')
console.log('3D Sound:', sound3d)

// Slowverb
const slowverb = await convert(input, 'slowverb', 0.8)
console.log('Slowverb:', slowverb)

// Cut 1 menit sampai 2 menit
const cut = await convert(input, 'cut', '1:00', '2:00')
console.log('Cut:', cut)