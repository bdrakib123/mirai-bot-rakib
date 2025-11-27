const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
    name: 'cdp',
    version: '1.0.0',
    hasPermssion: 0,
    credits: 'YourName + RubishAPI',
    description: 'Make Stylish CDP using Rubish API',
    commandCategory: 'Media',
    usages: 'reply image or give image URL',
    cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;

    let imageUrl = null;

    // যদি reply করা থাকে
    if (
        messageReply &&
        messageReply.attachments &&
        messageReply.attachments[0] &&
        messageReply.attachments[0].type === 'photo'
    ) {
        imageUrl = messageReply.attachments[0].url;
    } 
    // না হলে args থেকে নাও
    else if (args[0]) {
        imageUrl = args[0];
    }

    if (!imageUrl) {
        return api.sendMessage(
            "❌ একটি ছবিতে reply দাও অথবা ছবির URL পাঠাও।",
            threadID,
            messageID
        );
    }

    try {
        const apiUrl = `https://rubish.online/rubish/cdp?apikey=rubish69&image=${encodeURIComponent(imageUrl)}`;

        console.log("CDP API LINK:", apiUrl);

        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');

        const tempPath = path.join(__dirname, 'cache_cdp.jpg');
        await fs.writeFile(tempPath, buffer);

        await api.sendMessage(
            {
                body: '✅ Your Stylish CDP is Ready!',
                attachment: fs.createReadStream(tempPath)
            },
            threadID,
            () => fs.unlinkSync(tempPath),
            messageID
        );

    } catch (error) {
        console.error("CDP API Error:", error.message || error);
        api.sendMessage(
            `❌ CDP তৈরি করা যায়নি।\nError: ${error.message || 'Unknown error'}`,
            threadID,
            messageID
        );
    }
};
