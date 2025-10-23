module.exports.config = {
  name: "tags",
  version: "1.2.0",
  hasPermssion: 0,
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️ BOT TEAM",
  description: "Everyone mention & reply mention with default messages",
  commandCategory: "group",
  usages: ".everyone <message> OR reply + .mention <message>",
  cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {
  const threadID = event.threadID;

  // =========================
  // 1️⃣ .everyone ফিচার
  // =========================
  if (args[0] && args[0].toLowerCase() === "everyone") {
    const threadInfo = await api.getThreadInfo(threadID);
    const mentions = threadInfo.participantIDs.map(id => ({ id, tag: "@everyone" }));

    // কাস্টম মেসেজ বা default
    const customMsg = args.slice(1).join(" ") || "@everyone, দয়া করে সবাই মনোযোগ দাও! 😎";

    return api.sendMessage({
      body: customMsg,
      mentions
    }, threadID);
  }

  // =========================
  // 2️⃣ .mention ফিচার
  // =========================
  if (args[0] && args[0].toLowerCase() === "mention") {
    if (event.type !== "message_reply") {
      return api.sendMessage("⚠️ এই কমান্ড ব্যবহার করার জন্য কারো মেসেজে reply দাও এবং তারপর .mention টাইপ করো।", threadID);
    }

    const mentionID = event.messageReply.senderID;
    const userInfo = await api.getUserInfo(mentionID);
    const mentionName = userInfo[mentionID].name;

    const customMsg = args.slice(1).join(" ") || "";

    return api.sendMessage({
      body: `@${mentionName} ${customMsg}`.trim(),
      mentions: [{
        id: mentionID,
        tag: `@${mentionName}`
      }]
    }, threadID, event.messageID);
  }

  // =========================
  // যদি কোন ফিচার না মিললে
  // =========================
  return api.sendMessage(
    "⚠️ ব্যবহার: \n.everyone <message> OR reply + .mention <message>",
    threadID
  );
};
