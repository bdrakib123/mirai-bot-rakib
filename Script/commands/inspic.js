const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "inspic",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
  description: "Download Instagram photo or video by link",
  commandCategory: "media",
  usages: ".inspic <instagram link>",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const link = args.join(" ");
    if (!link) return api.sendMessage("📸 অনুগ্রহ করে Instagram এর লিংক দাও!\n\nউদাহরণ: .inspic https://www.instagram.com/p/xyz123/", event.threadID, event.messageID);

    api.sendMessage("⏳ একটু অপেক্ষা করো... মিডিয়া ডাউনলোড হচ্ছে!", event.threadID, event.messageID);

    // Instagram public page থেকে data আনছে
    const res = await axios.get(link + "?__a=1&__d=dis");
    const data = res.data;

    let mediaUrl;

    // ছবি বা ভিডিও ডিটেক্ট করা
    if (data?.graphql?.shortcode_media?.is_video) {
      mediaUrl = data.graphql.shortcode_media.video_url;
    } else {
      mediaUrl = data.graphql.shortcode_media.display_url;
    }

    if (!mediaUrl) {
      return api.sendMessage("⚠️ মিডিয়া খুঁজে পাওয়া যায়নি! লিংকটি পাবলিক কিনা দেখো।", event.threadID, event.messageID);
    }

    // ফাইল সংরক্ষণের জায়গা
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const fileExt = mediaUrl.includes(".mp4") ? ".mp4" : ".jpg";
    const filePath = path.join(cacheDir, "insta" + Date.now() + fileExt);

    // মিডিয়া ডাউনলোড
    const writer = fs.createWriteStream(filePath);
    const response = await axios({ url: mediaUrl, method: "GET", responseType: "stream" });
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage(
        { body: "✅ Instagram মিডিয়া সফলভাবে ডাউনলোড হয়েছে!", attachment: fs.createReadStream(filePath) },
        event.threadID,
        () => fs.unlinkSync(filePath) // পাঠানো শেষে cache ফাইল মুছে ফেলা
      );
    });
  } catch (e) {
    console.error(e);
    api.sendMessage("❌ ডাউনলোড ব্যর্থ! হয়তো প্রাইভেট বা ভুল লিংক।", event.threadID, event.messageID);
  }
};
