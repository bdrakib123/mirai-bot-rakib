module.exports.config = {
    name: "usta",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "RAKIB",
    description: "যাকে রিপ্লাই বা ম্যানশন করবে, তাকে একটি fun pair image পাঠাবে",
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

    let circleOne = await jimp.read(await circle(avatarOne));
    let circleTwo = await jimp.read(await circle(avatarTwo));
    base_img.composite(circleOne.resize(150, 150), 140, 200).composite(circleTwo.resize(150, 150), 980, 200);

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

    if (event.type == "message_reply") {
        partnerID = event.messageReply.senderID;
        mentions.push({ id: senderID, tag: (await api.getUserInfo(senderID))[senderID].name });
        mentions.push({ id: partnerID, tag: (await api.getUserInfo(partnerID))[partnerID].name });
    } else if (event.mentions && Object.keys(event.mentions).length > 0) {
        partnerID = Object.keys(event.mentions)[0];
        mentions.push({ id: senderID, tag: (await api.getUserInfo(senderID))[senderID].name });
        mentions.push({ id: partnerID, tag: (await api.getUserInfo(partnerID))[partnerID].name });
    } else return api.sendMessage("রিপ্লাই বা ম্যানশন করতে হবে।", threadID);

    // Random match percentage
    const percentages = ['21%', '67%', '19%', '37%', '17%', '96%', '52%', '62%', '76%', '83%', '100%', '99%', '0%', '48%'];
    const matchRate = percentages[Math.floor(Math.random() * percentages.length)];

    let one = senderID, two = partnerID;
    return makeImage({ one, two }).then(path => {
        api.sendMessage({
            body: `🥰 Successful Pairing!\n💌 Compatibility Score: ${matchRate}`,
            mentions,
            attachment: fs.createReadStream(path)
        }, threadID, () => fs.unlinkSync(path), messageID);
    });
};
