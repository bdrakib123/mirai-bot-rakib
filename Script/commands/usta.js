module.exports.config = {
  name: "usta",
  version: "1.0.2",
  hasPermssion: 0,
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝑶𝑻 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
  description: "Give a random user a 'usta' image (reply or mention supported)",
  commandCategory: "Fun",
  cooldowns: 5,
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "jimp": ""
  }
};

module.exports.onLoad = async () => {
  const { resolve } = global.nodemodule["path"];
  const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
  const { downloadFile } = global.utils;
  const dirMaterial = resolve(__dirname, 'cache', 'canvas');
  const path = resolve(dirMaterial, 'usta.png');
  if (!existsSync(dirMaterial)) mkdirSync(dirMaterial, { recursive: true });
  if (!existsSync(path)) {
    // ইউজারের চাহিদা অনুসারে Imgur লিংক বসানো আছে
    await downloadFile("https://i.imgur.com/6ghZH2l.png", path);
  }
};

async function makeImage({ one, two }) {
  const fs = global.nodemodule["fs-extra"];
  const path = global.nodemodule["path"];
  const axios = global.nodemodule["axios"];
  const jimp = global.nodemodule["jimp"];
  const __root = path.resolve(__dirname, "cache", "canvas");

  try {
    let pairing_img = await jimp.read(__root + "/usta.png");
    let pathImg = __root + `/usta_${one}_${two}.png`;
    let avatarOne = __root + `/avt_${one}.png`;
    let avatarTwo = __root + `/avt_${two}.png`;

    // ডাউনলোড ব্যাইনারি হিসেবে (arraybuffer) — utf-8 ব্যবহার করা হবে না
    let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne));

    let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo));

    let circleOne = await jimp.read(await circle(avatarOne));
    let circleTwo = await jimp.read(await circle(avatarTwo));

    // অবস্থান ও সাইজ চাইলে তুই বদলে নিবি
    pairing_img.composite(circleOne.resize(150, 150), 980, 200).composite(circleTwo.resize(150, 150), 140, 200);

    let raw = await pairing_img.getBufferAsync("image/png");

    fs.writeFileSync(pathImg, raw);
    // ক্লিনআপ
    if (fs.existsSync(avatarOne)) fs.unlinkSync(avatarOne);
    if (fs.existsSync(avatarTwo)) fs.unlinkSync(avatarTwo);

    return pathImg;
  } catch (e) {
    throw e;
  }
}

async function circle(image) {
  const jimp = require("jimp");
  image = await jimp.read(image);
  image.circle();
  return await image.getBufferAsync("image/png");
}

module.exports.run = async function ({ api, event }) {
  const axios = require("axios");
  const fs = require("fs-extra");
  const { threadID, messageID, senderID } = event;

  try {
    // Determine target user:
    // 1) If replied to someone (messageReply) and that user != sender => use replied user
    // 2) else if there are mentions => use first mentioned user who is not sender
    // 3) else pick random participant excluding sender
    let targetID = null;

    // 1) reply
    if (event.messageReply && event.messageReply.senderID && event.messageReply.senderID != senderID) {
      targetID = event.messageReply.senderID;
    }

    // 2) mentions
    if (!targetID && event.mentions) {
      // event.mentions is an object with id: name pairs
      const mentionIDs = Object.keys(event.mentions).filter(id => id !== senderID);
      if (mentionIDs.length > 0) targetID = mentionIDs[0];
    }

    // 3) fallback random participant
    if (!targetID) {
      let threadInfo = await api.getThreadInfo(threadID);
      let participants = threadInfo.participantIDs.filter(id => id !== senderID);
      if (!participants || participants.length === 0) {
        // যদি অন্য কেউ না থাকে, তাহলে sender-কে টার্গেট করা হবে
        targetID = senderID;
      } else {
        targetID = participants[Math.floor(Math.random() * participants.length)];
      }
    }

    // গ্রাহক/পাঠানোর নাম লাগলে নিচে info নিয়ে নাও (mentions তৈরি করার জন্য)
    let senderInfo = await api.getUserInfo(senderID);
    let senderName = (senderInfo && senderInfo[senderID] && senderInfo[senderID].name) ? senderInfo[senderID].name : "Sender";

    let targetInfo = await api.getUserInfo(targetID);
    let targetName = (targetInfo && targetInfo[targetID] && targetInfo[targetID].name) ? targetInfo[targetID].name : "Target";

    let mentions = [
      { id: senderID, tag: senderName },
      { id: targetID, tag: targetName }
    ];

    // Generate image
    let one = senderID, two = targetID;
    let path = await makeImage({ one, two });

    // Send message
    return api.sendMessage({
      body: `এই নে উষ্টা খা।`,
      mentions,
      attachment: fs.createReadStream(path)
    }, threadID, () => {
      if (fs.existsSync(path)) fs.unlinkSync(path);
    }, messageID);

  } catch (err) {
    console.error(err);
    // বুঝিয়ে দেয়ার জন্য ইউজারকে মেসেজ
    return api.sendMessage(`কিছু একটা সমস্যা হয়েছে: ${err.message ? err.message : err}`, threadID, messageID);
  }
};
