module.exports.config = {
 name: "antiout",
 eventType: ["log:unsubscribe"],
 version: "0.0.1",
 credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
 description: "Listen events"
};

module.exports.run = async({ event, api, Threads, Users }) => {
 let data = (await Threads.getData(event.threadID)).data || {};
 if (data.antiout == false) return;
 if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;
 const name = global.data.userName.get(event.logMessageData.leftParticipantFbId) || await Users.getNameUser(event.logMessageData.leftParticipantFbId);
 const type = (event.author == event.logMessageData.leftParticipantFbId) ? "self-separation" : "Koi Ase Pichware Mai Lath Marta Hai?";
 if (type == "self-separation") {
  api.addUserToGroup(event.logMessageData.leftParticipantFbId, event.threadID, (error, info) => {
   if (error) {
    api.sendMessage(`সরি বস এই আবালরে এড করতে পারলাম না \n ${name} ও মনে হয় ব্লক মারছে অথবা তার আইডিতে মেসেঞ্জার অপশন ব্লক করা তাই এড করতে পারলাম না😞 \n\n তবে মনে রাখুক এই সিস্টেম মাফ করে না! \n পরের বার এমন ঘটলে মাফিয়া মোড নিজ থেকেই এ্যাকশন নিবে  `, event.threadID)
   } else api.sendMessage(`শোন, ${name} এটা ব্রো আজাইরা গ্রুপ না! \n এখান থেকে যাইতে হইলে এডমিনের ক্লিয়ারেন্স লাগে! \nতুই পারমিশন ছাড়া লিভ নিছোস তাই তোকে আবার মাফিয়া স্টাইলে এড দিলাম। \n\n মাফিয়া সিস্টেম চালু হয়ে গেছে এখন তোকে নজরে রাখা হলো \n পরের বার এমন ঘটলে মাফিয়া মোড নিজ থেকেই অ্যাকশন নিবে  `, event.threadID);
  })
 }
}
