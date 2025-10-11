module.exports.config = {
  name: "infobox",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "CYBER-BOT TEAM",
  description: "Xem thông tin box của bạn (safe version)",
  commandCategory: "Thông tin",
  usages: "infobox",
  cooldowns: 10,
};

module.exports.run = async function({ api, event }) {
  const { threadID } = event;

  // Safe placeholder data
  const threadName = "Safe Group Name";
  const threadMem = 10;
  const qtv = 2;
  const nam = 5;
  const nu = 5;
  const sl = 1234;
  const id = "1234567890";

  const msg = `🌟 Info Box 🌟
─────────────────
📝 Box Name: ${threadName}
👥 Total Members: ${threadMem}
🔧 Administrators: ${qtv}
♂️ Male: ${nam}
♀️ Female: ${nu}
💬 Total Messages: ${sl}
🆔 Box ID: ${id}
─────────────────
⚠️ All personal data and avatars have been removed for privacy`;

  return api.sendMessage({ body: msg }, threadID);
};
