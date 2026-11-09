# Scrape Collection

Kumpulan scraper JavaScript (CJS/ESM) yang sudah dikategorikan berdasarkan fungsinya.

## Struktur Folder

```
categorized/
├── download/     → Downloader video / audio / foto
├── search/       → Pencarian konten
├── ai/           → AI chat, generate & detect
├── image/        → Image & media processing
├── tools/        → Utility tools
├── package.json
└── package-lock.json
```

---

## DOWNLOAD — Downloader (Video / Audio / Foto)

| File | Deskripsi | Source |
|------|-----------|--------|
| `AnyDown.js` | Any Downloader (multi platform) | https://dl.valore.web.id |
| `FBDown.js` | Facebook Downloader | https://fget.io |
| `Instagram.js` | Instagram Download (video + image carousel) | https://clipssaver.com |
| `igdl.js` | Instagram Downloader (video/photo carousel) | https://igexport.com |
| `igdl2.js` | Instagram Downloader (support story) | https://savefromins.com |
| `instastory.js` | Instagram Story Download | https://snapinsta.im |
| `TikGram.js` | TikTok + Instagram Lookup | https://clipssaver.com |
| `tiktok.js` | TikTok Download (support photo slide) | https://lovetik.com |
| `tiktokv2.js` | TikTok Downloader v2 | - |
| `Threads.js` | Threads Downloader (support foto slide) | https://www.threadsdl.app |
| `pinterest.js` | Pinterest Download (support carousel) | https://pintsave.net |
| `Spotify.js` | Spotify Downloader | https://myspoty.app |
| `spotifyplay.js` | Spotify Play (FAST) | https://spotidown.app |
| `spotiplay.js` | Spotify Play Music | https://spotmp3.net |
| `YTDL.js` | YouTube Downloader (cepat) | https://www.clipto.com |
| `ytdl2.js` | YouTube Download MP3/MP4 (fast response) | https://scriptmind.co |
| `ytmp3.js` | YouTube to MP3 | - |
| `ytmp4.js` | YouTube Video Downloader | https://nevercap.ai |
| `ytmp4-v2.js` | YouTube to MP4 v2 | - |
| `ytplay.js` | YouTube Play / Resolve | - |
| `YTSlide.js` | YouTube Community Post / Photo Slide | https://studioseo.tools |
| `YTVideo.js` | YouTube Video | https://www.sosmedsaver.me |
| `Vidssave.js` | All Platform Downloader (support photo slide) | https://vidssave.com |
| `aio.js` | All-in-One Downloader | https://www.videodownloadertools.com |
| `capcut.js` | CapCut Downloader | https://capdownloader.com |
| `TeraBox.js` | Terabox Download | https://teradownloadertool.com |
| `terabox2.js` | Terabox Downloader v2 | https://teradownloader.pro |

---

## SEARCH — Pencarian

| File | Deskripsi | Source |
|------|-----------|--------|
| `AppleMuiscSearch.js` | Apple Music Search | https://music.apple.com |
| `Spotifysearch.js` | Spotify Search | https://spotify.com |
| `Soundcloudserach.js` | SoundCloud Search | https://m.soundcloud.com |
| `Lyrics.js` | Lyrics Search | https://lrclib.net |
| `tiktoksearch.js` | TikTok Search Video | https://www.revid.ai |
| `Sigstick.js` | Sticker Telegram Search | https://www.sigstick.com |
| `animeplay.js` | Anime Play (search, detail, watch) | https://wotanime.my.id |
| `manhwa.js` | Baca Manhwa | https://manwhaku.my.id |

---

## AI — AI (Chat / Generate / Detect)

| File | Deskripsi | Source |
|------|-----------|--------|
| `SurfSense.js` | GPT-5.4 Mini (SurfSense) | https://surfsense.com |
| `FeelBetterBot.js` | FeelBetterBot AI Chat | https://feelbetterbot.com |
| `deepseek-v4-flash.js` | DeepSeek AI V4 Flash | https://deep-seek.ai |
| `zervida.js` | AI Zervida (mirip Claude) | https://ai.zervida.my.id |
| `CreenImageGEN.js` | Image Generator AI | https://www.creen.ai |
| `text2image.js` | Text to Image | https://notegpt.io |
| `aislop.js` | Scan AI-Slop Website | https://www.sniffslop.com |
| `aislop.img.js` | Scan AI-Slop Image | https://hivedetect.ai |
| `nsfwdetect.js` | NSFW Detector | https://www.nyckel.com |

---

## IMAGE — Image & Media Processing

| File | Deskripsi | Source |
|------|-----------|--------|
| `UpScale.js` | Upscale Photo | https://imgupscaler.com |
| `enhance.js` | Enhanced Photo | https://imgupscaler.ai |
| `unblur.js` | Unblur Image | https://unblurimage.ai |
| `editimgai.js` | Edit Image AI (remove watermark dll) | https://unwatermark.ai |
| `UpPhoto.js` | Upload Photo → URL | https://phototourl.com |
| `ocr.js` | OCR (Image to Text) | https://ocr.space |
| `tts.js` | Text to Speech (150+ voice model) | https://starlabs.biz.id |
| `transkripsi.js` | Transkripsi Audio/Video → Text | https://uniscribe.co |
| `audioCNVRT.js` | Audio Converter | - |

---

## TOOLS — Utility

| File | Deskripsi | Source |
|------|-----------|--------|
| `SsWeb.js` | Screenshot Web Full Page | https://urlbox.com |
| `ssweb2.js` | Screenshot Website | https://microlink.io |
| `TempMail.js` | Temporary Email | https://temp-mail.io |
| `tempgmail.js` | Temporary Gmail | https://temp.tf |
| `Sub2unlock.js` | Sub2Unlock Shortlink | https://sub2unlocksl.com |
| `Web2Apk.js` | Web to APK | https://webappcreator.amethystlab.org |
| `Jadibot.js` | Jadibot Scraper | - |
| `amprem.js` | Alight Motion Premium | https://dapjimotionpro.my.id |
| `amprem2.js` | Alight Motion Premium V2 | https://am.neonode.my.id |
| `stctele.js` | Sticker Telegram tools | - |

---

## Dependency

```bash
npm install axios
```

Beberapa file mungkin membutuhkan dependency tambahan:
- `cheerio`
- `form-data`
- `jszip`
- `youtubei.js` (untuk beberapa YouTube scraper)

---
