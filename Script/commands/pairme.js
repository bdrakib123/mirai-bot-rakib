const fs = require("fs");

module.exports.config = {
  name: "pairme",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
  description: "Pair yourself with someone or the person you reply/mention 💞",
  commandCategory: "Fun",
  usages: "[tag someone or reply]",
  cooldowns: 5,
};

module.exports.run = async function ({ api, event, Users }) {
  const { threadID, messageID, senderID, mentions, messageReply } = event;

  let senderName = await Users.getNameUser(senderID);
  let mentionID = Object.keys(mentions)[0];
  let targetID = null;
  let targetName = "";

  // যদি রিপ্লাই করা হয়
  if (messageReply && messageReply.senderID !== senderID) {
    targetID = messageReply.senderID;
    targetName = await Users.getNameUser(targetID);
  }

  // যদি mention করা হয়
  else if (mentionID) {
    targetID = mentionID;
    targetName = mentions[mentionID];
  }

  // যদি কেউ না থাকে (random)
  else {
    const threadInfo = await api.getThreadInfo(threadID);
    const members = threadInfo.participantIDs.filter((id) => id != senderID);
    if (members.length === 0)
      return api.sendMessage("😅 এখানে pairing করার মতো কেউ নাই!", threadID, messageID);
    targetID = members[Math.floor(Math.random() * members.length)];
    targetName = await Users.getNameUser(targetID);
  }

  const imgURL = "https://i.imgur.com/Vlyy5zY.jpeg"; // চাইলে কাস্টম পিকচার দিতে পারো

  const msg = {
    body: `💞 ${senderName} 💞\n❤️‍🔥 is now paired with ❤️‍🔥\n💘 ${targetName} 💘\n\nPerfect match 😍💫`,
    attachment: await global.utils.getStreamFromURL(imgURL),
    mentions: [
      { tag: senderName, id: senderID },
      { tag: targetName, id: targetID },
    ],
  };

  return api.sendMessage(msg, threadID, messageID);
};
