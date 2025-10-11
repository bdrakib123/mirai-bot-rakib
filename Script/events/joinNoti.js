const fsExtra = require("fs-extra");
const pathModule = require("path");

module.exports.config = {
    name: "joinNoti",
    eventType: ["log:subscribe"],
    version: "1.0.1",
    credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
    description: "Notification of bots or people entering groups with random gif/photo/video",
    dependencies: {
        "fs-extra": "",
        "path": "",
        "pidusage": ""
    }
};

module.exports.onLoad = function () {
    const { existsSync, mkdirSync } = fsExtra;
    const { join } = pathModule;

    const path = join(__dirname, "cache", "joinvideo");
    if (!existsSync(path)) mkdirSync(path, { recursive: true });

    const path2 = join(__dirname, "cache", "joinvideo", "randomgif");
    if (!existsSync(path2)) mkdirSync(path2, { recursive: true });
};

module.exports.run = async function({ api, event }) {
    const { createReadStream, existsSync, readdirSync } = fsExtra;
    const { join } = pathModule;
    const { threadID } = event;

    try {
        // যদি বট নিজেই গ্রুপে যোগ হয়
        if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
            api.changeNickname(`[ ${global.config.PREFIX} ] • ${global.config.BOTNAME || ""}`, threadID, api.getCurrentUserID());
            return api.sendMessage(
                { body: "স্বাগত! 🙏", attachment: createReadStream(__dirname + "/cache/ullash.mp4") },
                threadID
            );
        }

        // নতুন সদস্যদের জন্য
        let { threadName, participantIDs } = await api.getThreadInfo(threadID);
        const threadData = global.data.threadData.get(parseInt(threadID)) || {};
        const pathVideo = join(__dirname, "cache", "joinvideo", `${threadID}.video`);

        // mentions & names
        let mentions = [], nameArray = [], memLength = [], i = 0;
        for (let id in event.logMessageData.addedParticipants) {
            const user = event.logMessageData.addedParticipants[id];
            nameArray.push(user.fullName);
            mentions.push({ tag: user.fullName, id: user.userFbId });
            memLength.push(participantIDs.length - i++);
        }
        memLength.sort((a, b) => a - b);

        // message template
        let msg = threadData.customJoin || 
`╭•┄┅═══❁🌺❁═══┅┄•╮
   আসসালামু আলাইকুম-!!🖤
╰•┄┅═══❁🌺❁═══┅┄•╯

✨🆆🅴🅻🅻 🅲🅾🅼🅴✨
❥𝐍𝐄𝐖 {type} [ {name} ]
আপনাকে আমাদের গ্রুপ {threadName}-এ স্বাগতম!
আপনি {soThanhVien} নং মেম্বার

╭•┄┅═══❁🌺❁═══┅┄•╮
  🌸   𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️  🌸
╰•┄┅═══❁🌺❁═══┅┄•╯`;

        msg = msg
            .replace(/\{name}/g, nameArray.join(', '))
            .replace(/\{type}/g, (memLength.length > 1) ? 'Friends' : 'Friend')
            .replace(/\{soThanhVien}/g, memLength.join(', '))
            .replace(/\{threadName}/g, threadName);

        // যদি গ্রুপ স্পেস না থাকে, ডিরেক্টরি বানাও
        const joinVideoDir = join(__dirname, "cache", "joinvideo");
        if (!existsSync(joinVideoDir)) fsExtra.mkdirSync(joinVideoDir, { recursive: true });

        // random gif
        const randomGifDir = join(joinVideoDir, "randomgif");
        const randomFiles = existsSync(randomGifDir) ? readdirSync(randomGifDir) : [];

        let formPush;
        if (existsSync(pathVideo)) {
            formPush = { body: msg, attachment: createReadStream(pathVideo), mentions };
        } else if (randomFiles.length != 0) {
            const pathRandom = join(randomGifDir, randomFiles[Math.floor(Math.random() * randomFiles.length)]);
            formPush = { body: msg, attachment: createReadStream(pathRandom), mentions };
        } else {
            formPush = { body: msg, mentions };
        }

        return api.sendMessage(formPush, threadID);

    } catch (e) {
        console.log("JoinNoti Error:", e.stack || e);
    }
};
