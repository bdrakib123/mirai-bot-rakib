// commands/onbot.js
module.exports.config = {
    name: "onbot",
    version: "1.0.0",
    hasPermssion: 2,
    credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
    description: "Turn the bot ON (enable all commands)",
    commandCategory: "system",
    cooldowns: 0
};

module.exports.run = ({ event, api }) => {
    const permission = ["61578362017875", "61581351693349"];
    if (!permission.includes(event.senderID))
        return api.sendMessage("[ ERR ] You don't have permission to use this command.", event.threadID, event.messageID);

    global.botDisabled = false;
    api.sendMessage("[ OK ] Bot is now ON. সব কমান্ড চালু ✅", event.threadID);
};
