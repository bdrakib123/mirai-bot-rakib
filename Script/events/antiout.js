module.exports.config = {
  name: "antiout",
  eventType: ["log:unsubscribe"],
  version: "1.0.1",
  credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
  description: "Prevents members from leaving the group without permission (Mafia Style)"
};

module.exports.run = async function ({ event, api, Threads, Users }) {
  const data = (await Threads.getData(event.threadID)).data || {};
  if (data.antiout === false) return;

  // যদি বট নিজেই লিভ করে, কিছু করবে না
  if (event.logMessageData.leftParticipantFbId === api.getCurrentUserID()) return;

  // লিভ নেওয়া মেম্বারের নাম
  const name =
    global.data.userName.get(event.logMessageData.leftParticipantFbId) ||
    await Users.getNameUser(event.logMessageData.leftParticipantFbId);

  // গ্রুপের নাম
  const threadName = await Threads.getName(event.threadID);

  // ইউজার নিজে লিভ করলে self-separation
  const type = (event.author === event.logMessageData.leftParticipantFbId)
    ? "self-separation"
    : "kick";

  if (type === "self-separation") {
    api.addUserToGroup(event.logMessageData.leftParticipantFbId, event.threadID, (error) => {
      if (error) {
        api.sendMessage(
`😎 সরি বস... চেষ্টা করেও ওই আবালরে এড়াতে পারলাম না 😞
${name} হয়তো ব্লক করছে, অথবা তার আইডিতে Messenger অপশন বন্ধ — তাই এড করা সম্ভব হয়নি।  

⚠️ তবে মনে রাখুক—এই সিস্টেম মাফ করে না!  
পরের বার এমন ঘটনা ঘটলে মাফিয়া মোড নিজে থেকেই একশন নেবে 😈  

──────·····✦·····──────`,
          event.threadID
        );
      } else {
        api.sendMessage(
`💀 শোন, ${name}...
${threadName} এই গ্রুপ হইলো গ্যাং!  
এখান থেকে যেতে হলে লাগে এডমিনের ক্লিয়ারেন্স — বুঝলা? 😎  
তুই পারমিশন ছাড়া লিভ নিছোস — তাই এখন মাফিয়া সিস্টেম চালু হয়ে গেছে 🔥  

⚠️ মনে রাখ—এই গ্যাং কাউরে মাফ করে না!  
পরের বার এমন করলে মাফিয়া মোড নিজে থেকেই একশন নেবে 😈  

──────·····✦·····──────`,
          event.threadID
        );
      }
    });
  }
};
