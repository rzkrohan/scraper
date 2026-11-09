/*
# Feature : Uploader Photo 
# Type : CJS
# Url : https://phototourl.com
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/
const axios = require("axios");
const FormData = require("form-data");

async function uploadPhoto(buffer, filename = "image.jpg") {
  const form = new FormData();
  form.append("file", buffer, filename);

  const { data } = await axios.post(
    "https://phototourl.com/api/upload",
    form,
    {
      headers: {
        ...form.getHeaders(),
        Accept: "application/json",
        Origin: "https://phototourl.com",
        Referer: "https://phototourl.com/"
      }
    }
  );

  return data;
}

// Contoh 
const result = await uploadPhoto(
  require("fs").readFileSync("./media/menu.jpg")
);

m.reply(JSON.stringify(result, null, 2));