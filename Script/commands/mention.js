module.exports.config = {
  name: "mention",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️ BOT TEAM",
  description: "Mention the person you replied to with optional custom message",
  commandCategory: "group",
  usages: "Reply to someone's message and type .mention <message>",
  cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {
  const threadID = event.threadID;

  // যদি reply না থাকে
  if (event.type !== "message_reply") {
    return api.sendMessage(
      "⚠️ এই কমান্ড ব্যবহার করতে কারো মেসেজে reply দাও এবং তারপর .mention টাইপ করো।",
      threadID
    );
  }

  const mentionID = event.messageReply.senderID;

  try {
    const userInfo = await api.getUserInfo(mentionID);
    const mentionName = userInfo[mentionID].name;

    // Custom message বা শুধু mention
    const customMsg = args.join(" ").trim() || "";

    return api.sendMessage({
      body: `@${mentionName} ${customMsg}`.trim(),
      mentions: [{
        id: mentionID,
        tag: `@${mentionName}`
      }]
    }, threadID, event.messageID);

  } catch (err) {
    return api.sendMessage("⚠️ ইউজারের তথ্য পাওয়া যায়নি।", threadID);
  }
};
