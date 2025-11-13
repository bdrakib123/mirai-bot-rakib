const axios = require("axios");
const fs = require('fs');

// বেস API URL ফাংশন
const baseApiUrl = async () => {
  const base = await axios.get(
    `https://raw.githubusercontent.com/cyber-ullash/cyber-ullash/refs/heads/main/UllashApi.json`,
  );
  // ধরে নেওয়া হলো baseApiUrl() একই রকমভাবে কাজ করবে এবং অন্য API গুলিও এর মাধ্যমে পাওয়া যাবে।
  // তবে TikTok এর জন্য নির্দিষ্ট API url টি সরাসরি ব্যবহার করা হলো।
  return 'https://mahbub-ullash.cyberbot.top/api'; 
};

// ফাইল ডাউনলোড করার ফাংশন (dipto)
async function dipto(url, pathName) {
  try {
    const response = (await axios.get(url, {
      responseType: "arraybuffer"
    })).data;

    fs.writeFileSync(pathName, Buffer.from(response));
    return fs.createReadStream(pathName);
  } catch (err) {
    throw err;
  }
}

// স্ট্রিম হিসাবে থাম্বনেইল ডাউনলোড করার ফাংশন (diptoSt)
async function diptoSt(url, pathName) {
  try {
    const response = await axios.get(url, {
      responseType: "stream"
    });
    response.data.path = pathName;
    return response.data;
  } catch (err) {
    throw err;
  }
}

module.exports.config = {
    name: "tik",
    version: "1.0.0",
    aliases: [ "tiktok", "tt"],
    credits: "dipto", // আপনার অনুরোধ অনুযায়ী
    countDown: 10,
    hasPermssion: 0,
    description: "Search and download TikTok videos",
    commandCategory: "media",
    usages: "{pn} <search query> \n   Example:\n{pn} funny cat"
}

module.exports.run = async ({ api, args, event, message }) => {
    let keyWord = args.join(" ");
    if (!keyWord) {
        return api.sendMessage(`অনুগ্রহ করে একটি TikTok ভিডিওর নাম লিখে সার্চ করুন।\nউদাহরণ: ${this.config.usages}`, event.threadID, event.messageID);
    }
    
    const maxResults = 6;
    let result;
    
    try {
        const apiUrl = `${await baseApiUrl()}/tiktok-search?q=${encodeURIComponent(keyWord)}`;
        const response = await axios.get(apiUrl);
        result = response.data.data ? response.data.data.slice(0, maxResults) : [];
        
    } catch (err) {
        console.error("TikTok Search API Error:", err);
        return api.sendMessage("❌ TikTok সার্চের সময় একটি সমস্যা হয়েছে।", event.threadID, event.messageID);
    }
    
    if (result.length === 0)
        return api.sendMessage("⭕ এই কিওয়ার্ডের সাথে কোনো সার্চ ফলাফল পাওয়া যায়নি: " + keyWord, event.threadID, event.messageID);
    
    let msg = "🔎 আপনার সার্চের ফলাফল:\n\n";
    let i = 1;
    const thumbnails = [];
    
    for (const info of result) {
        // info.cover হলো থাম্বনেইলের URL, যা diptoSt ফাংশনের জন্য প্রয়োজন
        if (info.cover) {
            thumbnails.push(diptoSt(info.cover, `tiktok_photo_${i}.jpg`));
        }
        
        msg += `${i++}. ${info.title ? info.title : 'No Title'}\nDuration: ${info.duration}\nAuthor: ${info.author.nickname}\n\n`;
    }
    
    api.sendMessage({
        body: msg + "এই মেসেজে একটি সংখ্যা দিয়ে রিপ্লাই করুন যেটি ডাউনলোড করতে চান:",
        attachment: await Promise.all(thumbnails)
    }, event.threadID, (err, info) => {
        if (err) return console.error("Message Send Error:", err);
        
        global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: event.senderID,
            result // সম্পূর্ণ ফলাফল সংরক্ষণ
        });
    }, event.messageID);
}

module.exports.handleReply = async ({ event, api, handleReply }) => {
    try {
        const { result } = handleReply;
        const choice = parseInt(event.body);
        
        if (!isNaN(choice) && choice <= result.length && choice > 0) {
            const infoChoice = result[choice - 1];
            // infoChoice.play হলো ভিডিও ডাউনলোড URL
            const videoUrl = infoChoice.play; 
            const videoTitle = infoChoice.title || "TikTok Video";

            if (!videoUrl) {
                return api.sendMessage("❌ নির্বাচিত ভিডিওর ডাউনলোড লিংক পাওয়া যায়নি।", event.threadID, event.messageID);
            }
            
            await api.unsendMessage(handleReply.messageID);

            api.sendMessage("📥 ভিডিও ডাউনলোড করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...", event.threadID, event.messageID);
            
            // dipto ফাংশন ব্যবহার করে ভিডিও ডাউনলোড এবং পাঠানো
            await api.sendMessage({
                body: `✅ ভিডিও ডাউনলোড সফল হয়েছে:\n• Title: ${videoTitle}\n• Author: ${infoChoice.author.nickname}`,
                attachment: await dipto(videoUrl, 'tiktok_video.mp4')
            }, event.threadID, () => fs.unlinkSync('tiktok_video.mp4'), event.messageID);

        } else {
            api.sendMessage("অকার্যকর পছন্দ। অনুগ্রহ করে ১ এবং ৬ এর মধ্যে একটি সংখ্যা লিখুন।", event.threadID, event.messageID);
        }
    } catch (error) {
        console.error("TikTok Download Error:", error);
        api.sendMessage("⭕ দুঃখিত, ভিডিও ডাউনলোড বা পাঠানোর সময় একটি সমস্যা হয়েছে। ফাইল সাইজ বা নেটওয়ার্কের কারণেও হতে পারে।", event.threadID, event.messageID);
    }   
};

// dipto এবং diptoSt ফাংশনগুলো কোডের শেষে আছে, যেভাবে sing.js এ ছিল।
// (যদিও উপরে আমি সংজ্ঞায়িত করেছি, মডিউলের বাইরে থাকলে তা একই ফাইলের মধ্যে কাজ করবে।)
