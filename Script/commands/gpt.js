const axios = require('axios');

module.exports.config = {
  name: "gpt",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Created by You & HOON",
  description: "AI চ্যাট: দেওয়া API দিয়ে প্রশ্নের উত্তর প্রদর্শন করে",
  commandCategory: "AI",
  usages: "gpt <প্রশ্ন>",
  cooldowns: 5,
  usePrefix: true
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  if (!args || args.length === 0) {
    return api.sendMessage(
      "দয়া করে একটি প্রশ্ন লিখে পাঠাও। উদাহরণ: .gpt তুমি কেমন আছো?",
      threadID,
      messageID
    );
  }

  const question = args.join(" ");
  const url = `https://mahbub-ullash.cyberbot.top/api/aichat?question=${encodeURIComponent(question)}`;

  try {
    const res = await axios.get(url, {
      timeout: 25000,
      headers: {
        'User-Agent': 'Cyber-Bot-gpt/1.0'
      }
    });

    const data = res?.data;

    if (!data) {
      return api.sendMessage("কোনো সঠিক উত্তর পাওয়া যায়নি 😢", threadID, messageID);
    }

    // API reply যাচাই
    let replyText = "";
    if (typeof data === 'string') replyText = data;
    else if (data.reply) replyText = data.reply;
    else if (data.answer) replyText = data.answer;
    else if (data.output) replyText = data.output;
    else if (data.message) replyText = data.message;
    else replyText = JSON.stringify(data, null, 2);

    if (replyText.length > 1900) {
      replyText = replyText.slice(0, 1900) + '\n\n[✂️ উত্তরটি আংশিক দেখানো হয়েছে]';
    }

    return api.sendMessage(
      `💬 ${replyText}\n\n💻 Operator: HOON`,
      threadID,
      messageID
    );

  } catch (error) {
    console.error('gpt error =>', error);
    return api.sendMessage(
      '⚠️ API কল করতে সমস্যা হয়েছে: ' + (error.message || error),
      threadID,
      messageID
    );
  }
};
