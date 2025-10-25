module.exports.config = {
  name: "pairme",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝐀𝐌_ ☢️",
  description: "Pair yourself with a mentioned or replied user (photo version)",
  commandCategory: "Picture",
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
  const dirMaterial = __dirname + `/cache/canvas/`;
  const path = resolve(__dirname, 'cache/canvas', 'pairing.png');
  if (!existsSync(dirMaterial + "canvas")) mkdirSync(dirMaterial, { recursive: true });
  if (!existsSync(path)) await downloadFile("https://i.postimg.cc/X7R3CLmb/267378493-3075346446127866-4722502659615516429-n.png", path);
};

async function makeImage({ one, two }) {
  const fs = global.nodemodule["fs-extra"];
  const path = global.nodemodule["path"];
  const axios = global.nodemodule["axios"];
  const jimp = global.nodemodule["jimp"];
  const __root = path.resolve(__dirname, "cache", "canvas");

  let pairing_img = await jimp.read(__root + "/pairing.png");
  let pathImg = __root + `/pairing_${one}_${two}.png`;
  let avatarOne = __root + `/avt_${one}.png`;
  let avatarTwo = __root + `/avt_${two}.png`;

  let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, 'utf-8'));

  let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, 'utf-8'));

  let circleOne = await jimp.read(await circle(avatarOne));
  let circleTwo = await jimp.read(await circle(avatarTwo));
  pairing_img.composite(circleOne.resize(150, 150), 980, 200).composite(circleTwo.resize(150, 150), 140, 200);

  let raw = await pairing_img.getBufferAsync("image/png");

  fs.writeFileSync(pathImg, raw);
  fs.unlinkSync(avatarOne);
  fs.unlinkSync(avatarTwo);

  return pathImg;
}

async function circle(image) {
  const jimp = require("jimp");
  image = await jimp.read(image);
  image.circle();
  return await image.getBufferAsync("image/png");
}

module.exports.run = async function ({ api, event }) {
  const fs = require("fs-extra");
  const { threadID, messageID, senderID, mentions, messageReply } = event;

  // 🧩 Determine partner (reply > mention)
  let partnerID = null;

  if (messageReply) {
    partnerID = messageReply.senderID;
  } else if (Object.keys(mentions).length > 0) {
    partnerID = Object.keys(mentions)[0];
  }

  if (!partnerID) {
    return api.sendMessage("⚠️ ব্যবহার: .pairme লিখে কাউকে মেনশন করুন অথবা তার মেসেজে রিপ্লাই করুন 💞", threadID, messageID);
  }

  // Compatibility %
  const percentages = ['21%', '67%', '19%', '37%', '17%', '96%', '52%', '62%', '76%', '83%', '100%', '99%', '0%', '48%'];
  const matchRate = percentages[Math.floor(Math.random() * percentages.length)];

  // User info
  let senderInfo = await api.getUserInfo(senderID);
  let partnerInfo = await api.getUserInfo(partnerID);
  let senderName = senderInfo[senderID].name;
  let partnerName = partnerInfo[partnerID].name;

  let mentionList = [
    { id: senderID, tag: senderName },
    { id: partnerID, tag: partnerName }
  ];

  // Generate image and send
  return makeImage({ one: senderID, two: partnerID }).then(path => {
    api.sendMessage({
      body: `💞 𝐏𝐀𝐈𝐑 𝐌𝐀𝐓𝐂𝐇 𝐅𝐎𝐔𝐍𝐃 💞\n━━━━━━━━━━━━━━\n🥰 ${senderName} ❤️ ${partnerName}\n💌 Compatibility: ${matchRate}\n━━━━━━━━━━━━━━\n✨ একসাথে থাকো সুখে 💫`,
      mentions: mentionList,
      attachment: fs.createReadStream(path)
    }, threadID, () => fs.unlinkSync(path), messageID);
  });
};
