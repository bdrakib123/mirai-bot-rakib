module.exports.config = {
  name: "everyone",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
  description: "Send @everyone message",
  commandCategory: "group",
  usages: "",
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  return api.sendMessage("@everyone", event.threadID);
};
