module.exports.config = {
    name: "usta",
    version: "1.0",
    hasPermssion: 0,
    credits: "Rakib",
    description: "ম্যানশন বা রিপ্লাই করা ইউজারকে GIF এর মাধ্যমে আক্রমণ",
    commandCategory: "Fun",
    usages: "[reply/tag]",
    cooldowns: 5
};

module.exports.run = async function({ api, event }) {
    try {
        let mention = event.senderID; // ডিফল্ট: মেসেজ পাঠানো ইউজার
        if (event.type === "message_reply") mention = event.messageReply.senderID; // রিপ্লাই
        else if (event.mentions && Object.keys(event.mentions).length > 0) mention = Object.keys(event.mentions)[0]; // ম্যানশন

        const gifUrl = "https://i.imgur.com/gcWDMdp.gif";

        return api.sendMessage({
            body: `@${mention} এই নে উষ্টা খা 🦵`,
            mentions: [{ tag: `@${mention}`, id: mention }],
            attachment: [gifUrl]
        }, event.threadID);

    } catch (err) {
        console.log(err);
    }
};
