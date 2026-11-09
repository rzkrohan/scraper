/*
# Scrape : Image generator Ai
# Type : CJS
# Url : https://www.creen.ai
# Snippet : https://snippet.zellrayy.com/YxKkU8WvRE
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/
const axios = require("axios");

// Ambil tokennya lewat DevTools (Inspect) di browser.
const AUTH_TOKEN = "_";
const FINGER = "_";

const api = axios.create({
  baseURL: "https://www.creen.ai/api",
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "x-platform": "web",
    "x-version": "999.0.0",
    "x-language": "id",
    "x-auth-token": AUTH_TOKEN,
    "x-finger": FINGER
  }
});

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function createImage(prompt) {
  const { data } = await api.post("/aiImage/create/v2", {
    modelId: 14,
    baseImage: "",
    imageUrls: [],
    prompt,
    resolution: "1K",
    quality: "low",
    aspectRatio: "16:9",
    number: 1,
    permission: 1
  });

  return data;
}

async function getTaskStatus(resultId) {
  const { data } = await api.post("/aiImage/getListTaskStatus", {
    resultIds: [resultId]
  });

  return data;
}

async function generate(prompt, m) {
  const create = await createImage(prompt);

  const result = create.data.result.dataList[0];
  const resultId = result.id;

  await m.reply(`Result ID: ${resultId}`);

  while (true) {
    await sleep(3000);

    const status = await getTaskStatus(resultId);
    const task = status.data[0];

    await m.reply(`Status: ${task.status}`);

    if (task.status === 2 && task.resultUrl) {
      return task.resultUrl;
    }

    if (task.errorMessage) {
      throw new Error(task.errorMessage);
    }
  }
}

try {
  const image = await generate("cat", m);

  await m.reply(image);
} catch (e) {
  if (e.response) {
    await m.reply(JSON.stringify(e.response.data, null, 2));
  } else {
    await m.reply(String(e.message));
  }
}