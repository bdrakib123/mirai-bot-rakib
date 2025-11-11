module.exports.config = {
    name: "usta",
    version: "1.0.2",
    hasPermssion: 0,
    credits: "RAKIB (Kick Head Ver.)",
    description: "যাকে রিপ্লাই বা ম্যানশন করবে, তাকে কিক দিচ্ছে এমন মজার ছবি পাঠাবে",
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
    const path = resolve(__dirname, 'cache/canvas', 'usta.png');
    if (!existsSync(dirMaterial)) mkdirSync(dirMaterial, { recursive: true });
    if (!existsSync(path)) await downloadFile("https://i.imgur.com/KqFFME3.png", path);
};

async function makeImage({ one, two }) {
    const fs = global.nodemodule["fs-extra"];
    const path = global.nodemodule["path"];
    const axios = global.nodemodule["axios"];
    const jimp = global.nodemodule["jimp"];
    const __root = path.resolve(__dirname, "cache", "canvas");

    let base_img = await jimp.read(__root + "/usta.png");
    let pathImg = __root + `/usta_${one}_${two}.png`;
    let avatarOne = __root + `/avt_${one}.png`;
    let avatarTwo = __root + `/avt_${two}.png`;

    let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512`, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, 'utf-8'));
    let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512`, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, 'utf-8'));

    let circleOne = await jimp.read(await circle(avatarOne)); // sender
    let circleTwo = await jimp.read(await circle(avatarTwo)); // mention

    // 🥋 Place avatars on heads
    base_img
        .composite(circleOne.resize(120, 120), 910, 130)  // kicker (sender)
        .composite(circleTwo.resize(130, 130), 420, 160); // getting kicked (mention)

    let raw = await base_img.getBufferAsync("image/png");
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
    const { threadID, messageID, senderID } = event;
    let mentions = [];
    let partnerID;

    if (event.messageReply) {
        partnerID = event.messageReply.senderID;
        mentions.push({ id: senderID, tag: (await api.getUserInfo(senderID))[senderID].name });
        mentions.push({ id: partnerID, tag: (await api.getUserInfo(partnerID))[partnerID].name });
    } else if (event.mentions && Object.keys(event.mentions).length > 0) {
        partnerID = Object.keys(event.mentions)[0];
        mentions.push({ id: senderID, tag: (await api.getUserInfo(senderID))[senderID].name });
        mentions.push({ id: partnerID, tag: (await api.getUserInfo(partnerID))[partnerID].name });
    } else {
        return api.sendMessage("রিপ্লাই বা ম্যানশন করতে হবে।", threadID);
    }

    let one = senderID, two = partnerID;
    return makeImage({ one, two }).then(path => {
        api.sendMessage({
            body: "এই নে উষ্টা খা 💥🥋",
            mentions,
            attachment: fs.createReadStream(path)
        }, threadID, () => fs.unlinkSync(path), messageID);
    });
};
