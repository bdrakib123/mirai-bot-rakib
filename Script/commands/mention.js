module.exports.config = {
  name: "mention",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
  description: "Mention the person you replied to",
  commandCategory: "group",
  usages: "Reply to someone's message and type .mention",
  cooldowns: 3
};

module.exports.run = async function({ api, event }) {
  // চেক করো ইউজার রিপ্লাই দিয়েছে কি না
  if (event.type !== "message_reply") {
    return api.sendMessage("⚠️ যাকে mention করতে চাও, তার মেসেজে reply দিয়ে .mention লেখো।", event.threadID, event.messageID);
  }

  // যাকে রিপ্লাই দেওয়া হয়েছে, তার ID নাও
  const mentionID = event.messageReply.senderID;
  const mentionName = event.messageReply.body || "User";

  // এখন mention পাঠাও
  return api.sendMessage({
    body: `@${mentionName}`,
    mentions: [{
      tag: `@${mentionName}`,
      id: mentionID
    }]
  }, event.threadID, event.messageID);
};
