const fs = require('fs-extra');

module.exports.config = {
  name: "announce",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Rakib Hasan",
  description: "Send a message to all groups where the bot is present",
  commandCategory: "Admin",
  usages: "reply or announce <message>",
  cooldowns: 5
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID, messageReply } = event;

  // ---- ONLY YOU CAN USE THIS COMMAND ----
  const ownerIDs = ["61581351693349"];
  const delayBetween = 600; // 0.6s delay per group

  if (!ownerIDs.includes(senderID)) {
    return api.sendMessage("❌ এই কমান্ড শুধু বট Owner ব্যবহার করতে পারবে।", threadID, messageID);
  }

  let content = "";
  if (messageReply && messageReply.body && messageReply.body.trim()) {
    content = messageReply.body.trim();
  } else if (args && args.length > 0) {
    content = args.join(" ").trim();
  }

  if (!content) {
    return api.sendMessage("❌ পাঠানোর জন্য message লিখো বা কোনো message-এ reply করো।", threadID, messageID);
  }

  try {
    let threads = await new Promise((resolve, reject) => {
      try {
        api.getThreadList(100, null, (err, list) => {
          if (err) return reject(err);
          resolve(list || []);
        });
      } catch (e) {
        reject(e);
      }
    });

    const groupThreads = (threads || []).filter(t => {
      if (t.isGroup === true) return true;
      if (t.threadID && String(t.threadID).startsWith("g_")) return true;
      if (Array.isArray(t.participantIDs) && t.participantIDs.length > 2) return true;
      if (Array.isArray(t.participants) && t.participants.length > 2) return true;
      return false;
    });

    if (!groupThreads.length) {
      return api.sendMessage("⚠️ কোনো গ্রুপে বট নেই — Announcement পাঠানো যাচ্ছে না।", threadID, messageID);
    }

    let success = 0;
    let failed = 0;

    await api.sendMessage(
      `📢 Announcement শুরু হচ্ছে...\nমোট গ্রুপ: ${groupThreads.length}`,
      threadID
    );

    for (const g of groupThreads) {
      const targetThreadID = g.threadID || g.id;
      if (!targetThreadID) continue;

      try {
        await api.sendMessage({ body: content }, targetThreadID);
        success++;
      } catch (err) {
        failed++;
      }

      await sleep(delayBetween);
    }

    await api.sendMessage(
      `✅ Announcement Complete!\n\nসফল: ${success}\nব্যর্থ: ${failed}\nমোট: ${groupThreads.length}`,
      threadID,
      messageID
    );

  } catch (error) {
    return api.sendMessage(
      `❌ Announcement ব্যর্থ হয়েছে।\nError: ${error.message}`,
      threadID,
      messageID
    );
  }
};
