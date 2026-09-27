/*
# Scrape : Web2APK
# Type : ESM
# Url : https://webappcreator.amethystlab.org
# Snippet : https://snippet.zellrayy.com/yXwHWxUu42
# Source : https://whatsapp.com/channel/0029Vb8SsEn4NViqwX3HaN0x
*/
import axios from "axios";
import fs from "fs";
import path from "path";
import os from "os";
import FormData from "form-data";

class Web2Apk {
  constructor() {
    this.apiUrl = "https://webappcreator.amethystlab.org/api/build-apk";
    this.baseUrl = "https://webappcreator.amethystlab.org";
  }

  isValidUrl(url) {
    return /^https?:\/\//i.test(url);
  }

  buildPackageName(appName) {
    const cleaned = appName.toLowerCase().replace(/[^a-z0-9]/g, "");
    return `com.${cleaned || "app"}.web2apk`;
  }

  saveIcon(buffer) {
    const dir = path.join(os.tmpdir(), "web2apk");

    if (!fs.existsSync(dir))
      fs.mkdirSync(dir, { recursive: true });

    const file = path.join(dir, `icon_${Date.now()}.png`);
    fs.writeFileSync(file, buffer);

    return file;
  }

  async create({
    url,
    appName,
    iconBuffer,
    versionName = "1.0.0",
    versionCode = 1
  }) {
    if (!this.isValidUrl(url)) {
      throw new Error("URL harus diawali http:// atau https://");
    }

    if (!appName) {
      throw new Error("Nama aplikasi kosong.");
    }

    if (!iconBuffer) {
      throw new Error("Icon aplikasi wajib disertakan.");
    }

    const packageName = this.buildPackageName(appName);
    const iconPath = this.saveIcon(iconBuffer);

    try {
      const form = new FormData();

      form.append("websiteUrl", url);
      form.append("appName", appName);
      form.append("icon", fs.createReadStream(iconPath));
      form.append("packageName", packageName);
      form.append("versionName", versionName);
      form.append("versionCode", versionCode);

      const { data } = await axios.post(this.apiUrl, form, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Origin": this.baseUrl,
          "Referer": this.baseUrl + "/",
          ...form.getHeaders()
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      });

      if (!data.success) {
        throw new Error(data.message || "Gagal membuat APK");
      }

      return {
        success: true,
        appName,
        packageName,
        downloadUrl: this.baseUrl + data.downloadUrl
      };
    } finally {
      if (fs.existsSync(iconPath))
        fs.unlinkSync(iconPath);
    }
  }
}

export default new Web2Apk();