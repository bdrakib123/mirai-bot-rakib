const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
    name: 'faceswap',
    version: '1.0.0',
    hasPermssion: 0,
    credits: 'YourName + RubishAPI',
    description: 'FaceSwap using Rubish API',
    commandCategory: 'Media',
    usages: 'reply 1-2 photos or reply 1 photo + give face URL',
    cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;

    let targetUrl = null;
    let faceUrl = null;

    // যদি reply করা থাকে
    if (messageReply && messageReply.attachments && messageReply.attachments.length > 0) {
        const atts = messageReply.attachments.filter(a => a.type === 'photo');

        if (atts[0]) {
            targetUrl = atts[0].url; // প্রথম ছবি = target
        }

        // যদি দ্বিতীয় ছবি থাকে, সেটাকে face হিসাবে ধরব
        if (atts[1]) {
            faceUrl = atts[1].url;
        }
    }

    // যদি faceUrl এখনো না থাকে, args[0] থেকে নেওয়ার চেষ্টা
    if (!faceUrl && args[0]) {
        faceUrl = args[0];
    }

    // ভ্যালিডেশন
    if (!targetUrl) {
        return api.sendMessage(
            "❌ আগে যে ছবির উপর মুখ বসাতে চাও, সেই ছবিটায় reply দাও (target image)।",
            threadID,
            messageID
        );
    }

    if (!faceUrl) {
        return api.sendMessage(
            "❌ যার মুখ বসাতে চাও, সেই দ্বিতীয় ছবিটা reply-তে দাও বা তার URL লিখো।\n\n" +
            "উদাহরণ:\n" +
            "– কারও ২টা ছবি reply করো (১ম = target, ২য় = face)\n" +
            "– অথবা ১টা ছবিতে reply করে লিখো: faceswap <face_image_url>",
            threadID,
            messageID
        );
    }

    try {
        // Rubish FaceSwap API URL বানানো
        const apiUrl = `https://rubish.online/rubish/faceswap?target=${encodeURIComponent(
            targetUrl
        )}&fce=${encodeURIComponent(faceUrl)}&apikey=rubish69`;

        console.log("FaceSwap API LINK:", apiUrl);

        // API থেকে ছবির ডাটা আনা
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');

        // টেম্প ফাইল পাথ
        const tempPath = path.join(__dirname, 'cache_faceswap.jpg');
        await fs.writeFile(tempPath, buffer);

        // ছবি পাঠানো
        await api.sendMessage(
            { body: '✅ FaceSwap Ready!', attachment: fs.createReadStream(tempPath) },
            threadID,
            () => fs.unlinkSync(tempPath),
            messageID
        );

    } catch (error) {
        console.error("FaceSwap API Error:", error.message || error);
        api.sendMessage(
            `❌ ছবি প্রসেস করতে পারছি না।\nError: ${error.message || 'Unknown error'}`,
            threadID,
            messageID
        );
    }
};
