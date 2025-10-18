module.exports.config = {
  name: "leaveall",
  version: "1.0.0",
  hasPermssion: 2,
  credits: "Ullash AI 😎",
  description: "সব গ্রুপ থেকে বটকে একসাথে লেফট করায়",
  commandCategory: "admin",
  usages: "",
  cooldowns: 10,
};

module.exports.run = async ({ api, event }) => {
  const allThreads = await api.getThreadList(100, null, ["INBOX"]);
  let count = 0;

  for (const thread of allThreads) {
    if (thread.isGroup && thread.threadID != event.threadID) {
      await api.removeUserFromGroup(api.getCurrentUserID(), thread.threadID);
      count++;
    }
  }

  return api.sendMessage(`✅ সব গ্রুপ থেকে লেফট দিলাম (${count} টা গ্রুপ)`, event.threadID);
};
