const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
    name: 'blur',
    version: '1.0.0',
    hasPermssion: 0,
    credits: 'Rakib',
    description: 'Apply blur effect to image using Rubish API',
    commandCategory: 'Media',
    usages: 'reply image or give image URL + optional blur level',
    cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;

    let imageUrl = null;
    let blurLevel = 5; // ডিফল্ট blur

    // reply থেকে ছবি নাও
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

    // blur level যদি দেয়া থাকে
    if (args[1] && !isNaN(args[1])) {
        blurLevel = args[1];
    }

    if (!imageUrl) {
        return api.sendMessage(
            "❌ একটি ছবিতে reply দাও বা ছবির URL দাও।\nউদাহরণ:\nblur 10",
            threadID,
            messageID
        );
    }

    try {
        const apiUrl = `https://rubish.online/rubish/edit-blur?url=${encodeURIComponent(imageUrl)}&blurLevel=${blurLevel}&apikey=rubish69`;

        console.log("Blur API LINK:", apiUrl);

        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');

        const tempPath = path.join(__dirname, 'cache_blur.jpg');
        await fs.writeFile(tempPath, buffer);

        await api.sendMessage(
            {
                body: `✅ Blur Image Ready! (Level: ${blurLevel})`,
                attachment: fs.createReadStream(tempPath)
            },
            threadID,
            () => fs.unlinkSync(tempPath),
            messageID
        );

    } catch (error) {
        console.error("Blur API Error:", error.message || error);
        api.sendMessage(
            `❌ ছবি প্রসেস করা যায়নি।\nError: ${error.message || 'Unknown error'}`,
            threadID,
            messageID
        );
    }
};
