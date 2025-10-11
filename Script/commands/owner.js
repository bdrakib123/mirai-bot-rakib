module.exports.config = {
  name: "admin",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "RAKIB", // don't change my credit 🙂
  description: "Show Owner Info",
  commandCategory: "info",
  usages: "",
  cooldowns: 5
};

module.exports.run = async function({ api, event }) {
  const moment = require("moment-timezone");
  const time = moment().tz("Asia/Dhaka").format("DD/MM/YYYY hh:mm:ss A");
  const threadID = event.threadID;

  const message = `
┏━━━━━━━━━━━━━━━━━━━━━┓
┃      🌟 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢 🌟      
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ 👤 𝐍𝐚𝐦𝐞      : 𝐑𝐀𝐊𝐈𝐁
┃ 🚹 𝐆𝐞𝐧𝐝𝐞𝐫    : 𝐌𝐚𝐥𝐞
┃ ❤️ 𝐑𝐞𝐥𝐚𝐭𝐢𝐨𝐧  : 𝐒𝐈𝐍𝐆𝐋𝐄
┃ 🎂 𝐀𝐠𝐞       : 𝟐𝟓
┃ 🕌 𝐑𝐞𝐥𝐢𝐠𝐢𝐨𝐧  : 𝐈𝐬𝐥𝐚𝐦
┃ 🏫 𝐄𝐝𝐮𝐜𝐚𝐭𝐢𝐨𝐧 : 𝐒𝐭𝐮𝐝𝐞𝐧𝐭
┃ 🏡 𝐀𝐝𝐝𝐫𝐞𝐬𝐬  : 𝐌𝐲𝐦𝐞𝐧𝐬𝐢𝐧𝐠𝐡, 𝐁𝐚𝐧𝐠𝐥𝐚𝐝𝐞𝐬𝐡
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ 🎭 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦 : spyer.rakib
┃ 📢 𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦 : https://t.me/spyer.rakib
┃ 🌐 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 : https://www.facebook.com/profile.php?id=61581351693349
┃ 📞 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 : +8801729789141
┃ 📧 𝐄𝐦𝐚𝐢𝐥 1 : spyer.rakib@gmail.com
┃ 📧 𝐄𝐦𝐚𝐢𝐥 2 : spyer.rakib@outlook.com
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ 🕒 𝐔𝐩𝐝𝐚𝐭𝐞𝐝 𝐓𝐢𝐦𝐞:  ${time}
┗━━━━━━━━━━━━━━━━━━━━━┛
  `;

  // Send only text (no attachments, no tokens, no images)
  return api.sendMessage({ body: message }, threadID);
};এই 
