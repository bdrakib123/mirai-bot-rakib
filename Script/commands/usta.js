module.exports.config = {
  name: "usta",
  version: "1.0.5",
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
  const fs = require("fs-extra");
  const path = require("path");
  const dir = path.resolve(__dirname, "cache", "canvas");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  // ডাউনলোড লজিক নেই, আপলোড করা uata.png ব্যবহার হবে
};

async function makeImage({ one, two }) {
  const fs = global.nodemodule["fs-extra"];
  const path = global.nodemodule["path"];
  const axios = global.nodemodule["axios"];
  const jimp = global.nodemodule["jimp"];
  const __root = path.resolve(__dirname, "cache", "canvas");

  try {
    let pairing_img = await jimp.read(__root + "/uata.png");
    let pathImg = __root + `/usta_${one}_${two}.png`;
    let avatarOne = __root + `/avt_${one}.png`;
    let avatarTwo = __root + `/avt_${two}.png`;

    // === Facebook Avatar ডাউনলোড ===
    let getAvatarOne = (await axios.get(
      `https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: 'arraybuffer' }
    )).data;
    fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne));

    let getAvatarTwo = (await axios.get(
      `https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: 'arraybuffer' }
    )).data;
    fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo));

    // circle avatars
    let circleOne = await jimp.read(await circle(avatarOne));
    let circleTwo = await jimp.read(await circle(avatarTwo));

    // === Composite avatars on uata.png ===
    pairing_img.
      composite(circleOne.resize(75, 75), 90, 165).
      composite(circleTwo.resize(75, 75), 30, 165);

    let raw = await pairing_img.getBufferAsync("image/png");
    fs.writeFileSync(pathImg, raw);

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
  const fs = require("fs-extra");
  const { threadID, messageID, senderID } = event;

  try {
    let targetID = null;

    // reply check
    if (event.messageReply && event.messageReply.senderID && event.messageReply.senderID != senderID) {
      targetID = event.messageReply.senderID;
    }

    // mentions check
    if (!targetID && event.mentions) {
      const mentionIDs = Object.keys(event.mentions).filter(id => id !== senderID);
      if (mentionIDs.length > 0) targetID = mentionIDs[0];
    }

    // fallback random participant
    if (!targetID) {
      let threadInfo = await api.getThreadInfo(threadID);
      let participants = threadInfo.participantIDs.filter(id => id !== senderID);
      targetID = participants.length > 0 ? participants[Math.floor(Math.random() * participants.length)] : senderID;
    }

    let senderInfo = await api.getUserInfo(senderID);
    let senderName = senderInfo[senderID].name || "Sender";

    let targetInfo = await api.getUserInfo(targetID);
    let targetName = targetInfo[targetID].name || "Target";

    let mentions = [
      { id: senderID, tag: senderName },
      { id: targetID, tag: targetName }
    ];

    let path = await makeImage({ one: senderID, two: targetID });

    return api.sendMessage({
      body: `এই নে উষ্টা খা।`,
      mentions,
      attachment: fs.createReadStream(path)
    }, threadID, () => { if (fs.existsSync(path)) fs.unlinkSync(path); }, messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage(`কিছু একটা সমস্যা হয়েছে: ${err.message || err}`, threadID, messageID);
  }
};
