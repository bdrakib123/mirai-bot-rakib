const axios = require("axios");
const fs = require('fs');
const YT_API_KEY = "AIzaSyBF518a01djGKNmVsAeAEoj3pnFdT-fEu8";

const YT_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

const baseApiUrl = async () => {
  // keep your same JSON source for download API (if still needed)
  const base = await axios.get(
    `https://raw.githubusercontent.com/cyber-ullash/cyber-ullash/refs/heads/main/UllashApi.json`,
  );
  return base.data.api;
};

module.exports.config = {
  name: "song",
  version: "3.0.0",
  aliases: ["music", "play"],
  credits: "dipto (upgraded by ChatGPT)",
  countDown: 5,
  hasPermssion: 0,
  description: "Download audio from YouTube (using YouTube Data API v3 for search)",
  commandCategory: "media",
  usages: "{pn} [<song name>|<song link>]:\n   Example:\n{pn} chipi chipi chapa chapa"
};

module.exports.run = async ({ api, args, event, commandName, message }) => {
  const checkurl = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
  let videoID;
  const urlYtb = checkurl.test(args[0]);

  // If user sent a YouTube link directly
  if (urlYtb) {
    const match = args[0].match(checkurl);
    videoID = match ? match[1] : null;
    const { data: { title, downloadLink } } = await axios.get(
      `${await baseApiUrl()}/ytDl3?link=${videoID}&format=mp3`
    );
    return api.sendMessage({
      body: title,
      attachment: await dipto(downloadLink, 'audio.mp3')
    }, event.threadID, () => fs.unlinkSync('audio.mp3'), event.messageID);
  }

  // Otherwise: perform YouTube search using YouTube Data API v3
  const keyWord = args.join(" ");
  if (!keyWord)
    return api.sendMessage("❗ Please enter a song name or link.", event.threadID, event.messageID);

  const maxResults = 6;
  let result;
  try {
    const params = new URLSearchParams({
      part: "snippet",
      q: keyWord,
      type: "video",
      videoCategoryId: "10", // Music category
      maxResults: String(maxResults),
      key: YT_API_KEY,
      safeSearch: "strict"
    });
    const ytSearchUrl = `${YT_SEARCH_URL}?${params.toString()}`;
    const searchData = (await axios.get(ytSearchUrl)).data;

    result = searchData.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: { name: item.snippet.channelTitle },
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      time: "N/A" // YouTube search doesn’t return duration directly
    }));
  } catch (err) {
    return api.sendMessage("❌ YouTube search failed: " + err.message, event.threadID, event.messageID);
  }

  if (!result || result.length === 0)
    return api.sendMessage("⭕ No search results match the keyword: " + keyWord, event.threadID, event.messageID);

  // Compose message with thumbnails
  let msg = "";
  let i = 1;
  const thumbnails = [];
  for (const info of result) {
    thumbnails.push(await diptoSt(info.thumbnail, 'photo.jpg'));
    msg += `${i++}. ${info.title}\nChannel: ${info.channel.name}\n\n`;
  }

  api.sendMessage({
    body: msg + "Reply to this message with a number to download as audio",
    attachment: await Promise.all(thumbnails)
  }, event.threadID, (err, info) => {
    global.client.handleReply.push({
      name: module.exports.config.name,
      messageID: info.messageID,
      author: event.senderID,
      result
    });
  }, event.messageID);
};

module.exports.handleReply = async ({ event, api, handleReply }) => {
  try {
    const { result } = handleReply;
    const choice = parseInt(event.body);
    if (!isNaN(choice) && choice <= result.length && choice > 0) {
      const infoChoice = result[choice - 1];
      const idvideo = infoChoice.id;
      const { data: { title, downloadLink, quality } } = await axios.get(`${await baseApiUrl()}/ytDl3?link=${idvideo}&format=mp3`);
      await api.unsendMessage(handleReply.messageID);
      await api.sendMessage({
        body: `• Title: ${title}\n• Quality: ${quality}`,
        attachment: await dipto(downloadLink, 'audio.mp3')
      }, event.threadID,
        () => fs.unlinkSync('audio.mp3'),
        event.messageID);
    } else {
      api.sendMessage("Invalid choice. Please enter a number between 1 and 6.", event.threadID, event.messageID);
    }
  } catch (error) {
    console.log(error);
    api.sendMessage("⭕ Sorry, audio size was less than 26MB", event.threadID, event.messageID);
  }
};

async function dipto(url, pathName) {
  const response = (await axios.get(url, { responseType: "arraybuffer" })).data;
  fs.writeFileSync(pathName, Buffer.from(response));
  return fs.createReadStream(pathName);
}

async function diptoSt(url, pathName) {
  const response = await axios.get(url, { responseType: "stream" });
  response.data.path = pathName;
  return response.data;
                           }
