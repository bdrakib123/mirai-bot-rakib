const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "inspic",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "HOON VAI ✦ Modified by GPT-5",
  description: "Download all photos/videos from an Instagram post",
  commandCategory: "media",
  usages: "inspic [Instagram post link]",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, args }) {
  const link = args.join(" ");

  if (!link) {
    return api.sendMessage("📸 অনুগ্রহ করে Instagram পোস্টের লিংক দিন!", event.threadID, event.messageID);
  }

  const msg = await api.sendMessage("⏳ মিডিয়া ডাউনলোড হচ্ছে, একটু অপেক্ষা করুন...", event.threadID);

  try {
    const apiURL = `https://mahbub-ullash.cyberbot.top/api/igdl?url=${encodeURIComponent(link)}`;
    const res = await axios.get(apiURL);

    if (!res.data || !res.data.status || !res.data.result) {
      return api.sendMessage("❌ মিডিয়া পাওয়া যায়নি বা লিংক সঠিক নয়!", event.threadID, event.messageID);
    }

    const items = res.data.result; // API রেসপন্স অনুযায়ী result/media key হতে পারে
    const attachments = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const ext = item.url.includes(".mp4") ? "mp4" : "jpg";
      const filePath = path.join(__dirname, `cache/inspic_${i}.${ext}`);

      const media = await axios.get(item.url, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, Buffer.from(media.data, "binary"));
      attachments.push(fs.createReadStream(filePath));
    }

    await api.sendMessage(
      {
        body: `✅ ${attachments.length}টি মিডিয়া পাওয়া গেছে!`,
        attachment: attachments,
      },
      event.threadID,
      () => {
        attachments.forEach((_, i) => {
          const f = path.join(__dirname, `cache/inspic_${i}.jpg`);
          const v = path.join(__dirname, `cache/inspic_${i}.mp4`);
          if (fs.existsSync(f)) fs.unlinkSync(f);
          if (fs.existsSync(v)) fs.unlinkSync(v);
        });
      },
      event.messageID
    );
  } catch (err) {
    console.error(err);
    api.sendMessage("⚠️ কিছু ভুল হয়েছে বা সার্ভার রেসপন্স দিচ্ছে না!", event.threadID, event.messageID);
  } finally {
    api.unsendMessage(msg.messageID);
  }
};
