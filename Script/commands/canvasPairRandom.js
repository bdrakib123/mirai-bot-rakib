const fs = require("fs");
const path = require("path");

module.exports.config = {
    name: "canvasPairRandom",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "LoL",
    description: "Randomly pair you with someone and send a PNG",
    commandCategory: "fun",
};

module.exports.run = async ({ api, event, Users, Threads }) => {
    try {
        // Path adjust করা Script structure অনুযায়ী
        const canvasDir = path.join(__dirname, "cache/canvas");
        const files = fs.readdirSync(canvasDir).filter(f => f.endsWith(".png"));
        if (!files.length) return api.sendMessage("⚠️ কোনো PNG পাওয়া যায়নি!", event.threadID);

        // Random PNG
        const file = files[Math.floor(Math.random() * files.length)];
        const filePath = path.join(canvasDir, file);
        const title = file.replace(".png", "").replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

        // Thread info নিয়ে random member pick
        const threadInfo = await api.getThreadInfo(event.threadID);
        let members = threadInfo.userInfo.map(u => u.id).filter(id => id != event.senderID);

        // Pick random user or mentioned user
        let pairedUserID;
        if (event.mentions && Object.keys(event.mentions).length > 0) {
            pairedUserID = Object.keys(event.mentions)[0];
        } else if (members.length > 0) {
            pairedUserID = members[Math.floor(Math.random() * members.length)];
        } else {
            pairedUserID = event.senderID; // fallback, self
        }

        const pairedName = Users.getName(pairedUserID);

        // Send message
        api.sendMessage({
            body: `💞 ${Users.getName(event.senderID)} is paired with ${pairedName}!\nHere's a **${title}**!`,
            attachment: fs.createReadStream(filePath),
            mentions: [{ tag: pairedName, id: pairedUserID }]
        }, event.threadID);

    } catch (err) {
        console.error(err);
        api.sendMessage("⚠️ কিছু সমস্যা হয়েছে, পরে আবার চেষ্টা করো!", event.threadID);
    }
};
