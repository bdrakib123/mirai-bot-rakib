const axios = require("axios");
const fs = require("fs");

// 🧠 Auto API Selector with 4-level Fallback
const baseApiUrl = async () => {
  const backups = [
    "https://yt-api.kenliejugarap.com/api",
    "https://yt-api.mizzyhost.cloud/api",
    "https://api-v2-yt.vercel.app",
    "https://ytsearch.sumanjay.workers.dev"
  ];
  try {
    const base = await axios.get(
      "https://raw.githubusercontent.com/cyber-ullash/cyber-ullash/refs/heads/main/UllashApi.json"
    );
    return base.data.api;
  } catch {
    for (const url of backups) {
      try {
        await axios.get(url);
        console.log(`✅ Backup API working: ${url}`);
        return url;
      } catch (e) {
        console.log(`❌ ${url} failed`);
      }
    }
    console.log("⚠️ কোনো API কাজ করছে না, সব ডাউন!");
    return null;
  }
};

// 🪩 Command Config
module.exports.config = {
  name: "song",
  version: "4.0.0",
  aliases: ["sing", "music", "play"],
  credits: "dipto + upgraded by GPT",
  countDown: 5,
  hasPermssion: 0,
  description: "Download audio from YouTube (auto multi-fallback version)",
  commandCategory: "media",
  usages:
    "{pn} [<song name>|<song link>]:\n   Example:\n{pn} chipi chipi chapa chapa",
};

// 🪄 Main Run Function
module.exports.run = async ({ api, args, event }) => {
  const checkurl =
    /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
  let videoID;
  const urlYtb = checkurl.test(args[0]);

  const baseUrl = await baseApiUrl();
  if (!baseUrl)
    return api.sendMessage(
      "⚠️ কোনো API সার্ভার বর্তমানে অনলাইন নেই। কিছুক্ষণ পরে চেষ্টা করো!",
      event.threadID,
      event.messageID
    );

  // 🎧 যদি সরাসরি YouTube লিংক দেওয়া হয়
  if (urlYtb) {
    const match = args[0].match(checkurl);
    videoID = match ? match[1] : null;

    try {
      const { data } = await axios.get(
        `${baseUrl}/ytDl3?link=${videoID}&format=mp3`
      );
      const { title, downloadLink } = data;
      return api.sendMessage(
        {
          body: title,
          attachment: await downloadFile(downloadLink, "audio.mp3"),
        },
        event.threadID,
        () => fs.unlinkSync("audio.mp3"),
        event.messageID
      );
    } catch (e) {
      return api.sendMessage(
        "❌ Download failed. Try again later.",
        event.threadID,
        event.messageID
      );
    }
  }

  // 🔍 যদি নাম দিয়ে সার্চ করা হয়
  let keyWord = args.join(" ");
  keyWord = keyWord.includes("?feature=share")
    ? keyWord.replace("?feature=share", "")
    : keyWord;

  const maxResults = 6;
  let result;

  try {
    const res = await axios.get(
      `${baseUrl}/ytFullSearch?songName=${encodeURIComponent(keyWord)}`
    );
    result = res.data.slice(0, maxResults);
  } catch (err) {
    return api.sendMessage(
      "⚠️ Search failed: " + err.message,
      event.threadID,
      event.messageID
    );
  }

  if (!result || result.length === 0)
    return api.sendMessage(
      "⭕ No results for: " + keyWord,
      event.threadID,
      event.messageID
    );

  let msg = "";
  let i = 1;
  const thumbnails = [];

  for (const info of result) {
    thumbnails.push(downloadStream(info.thumbnail, "photo.jpg"));
    msg += `${i++}. ${info.title}\nTime: ${info.time}\nChannel: ${info.channel.name}\n\n`;
  }

  api.sendMessage(
    {
      body: msg + "Reply with a number to listen 🎵",
      attachment: await Promise.all(thumbnails),
    },
    event.threadID,
    (err, info) => {
      global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        author: event.senderID,
        result,
      });
    },
    event.messageID
  );
};

// 💬 Handle Reply
module.exports.handleReply = async ({ event, api, handleReply }) => {
  try {
    const { result } = handleReply;
    const choice = parseInt(event.body);
    if (isNaN(choice) || choice > result.length || choice <= 0)
      return api.sendMessage(
        "❌ Invalid choice. Enter a valid number.",
        event.threadID,
        event.messageID
      );

    const infoChoice = result[choice - 1];
    const idvideo = infoChoice.id;
    const baseUrl = await baseApiUrl();

    const { data } = await axios.get(
      `${baseUrl}/ytDl3?link=${idvideo}&format=mp3`
    );
    const { title, downloadLink, quality } = data;

    await api.unsendMessage(handleReply.messageID);
    await api.sendMessage(
      {
        body: `🎧 Title: ${title}\n🎵 Quality: ${quality}`,
        attachment: await downloadFile(downloadLink, "audio.mp3"),
      },
      event.threadID,
      () => fs.unlinkSync("audio.mp3"),
      event.messageID
    );
  } catch (error) {
    console.log(error);
    api.sendMessage(
      "⭕ Error: audio size too large or all APIs offline.",
      event.threadID,
      event.messageID
    );
  }
};

// 🧩 Helper: Download File
async function downloadFile(url, pathName) {
  const response = (await axios.get(url, { responseType: "arraybuffer" })).data;
  fs.writeFileSync(pathName, Buffer.from(response));
  return fs.createReadStream(pathName);
}

// 🧩 Helper: Stream Thumbnail
async function downloadStream(url, pathName) {
  const response = await axios.get(url, { responseType: "stream" });
  response.data.path = pathName;
  return response.data;
  }
