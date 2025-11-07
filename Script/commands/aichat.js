const axios = require('axios');

module.exports.config = {
  name: "aichat",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "Created by You & HOON",
  description: "AI চ্যাট: দেওয়া API দিয়ে প্রশ্ন করে উত্তর প্রদর্শন করে",
  commandCategory: "AI",
  usages: "aichat <প্রশ্ন>",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;

  if (!args || args.length === 0) {
    return api.sendMessage("দয়া করে একটি প্রশ্ন লিখে পাঠাও। উদাহরণ: .aichat তুমি কেমন আছো?", threadID, messageID);
  }

  const question = args.join(" ");
  const baseUrl = 'https://mahbub-ullash.cyberbot.top/api/aichat';
  const url = `${baseUrl}?question=${encodeURIComponent(question)}`;

  try {
    api.sendMessage("🤖 প্রশ্ন পাঠানো হচ্ছে... একটু অপেক্ষা করো 💭", threadID);

    const res = await axios.get(url, {
      timeout: 25000,
      headers: {
        'User-Agent': 'Cyber-Bot-aichat/1.0'
      }
    });

    const data = res && res.data ? res.data : null;

    if (!data) {
      return api.sendMessage("কোনো সঠিক উত্তর পাওয়া যায়নি 😢", threadID, messageID);
    }

    // যদি API সরাসরি text না দিয়ে reply হিসেবে দেয়
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
    console.error('aichat error =>', error);
    return api.sendMessage(
      '⚠️ API কল করতে সমস্যা হয়েছে: ' + (error.message || error),
      threadID,
      messageID
    );
  }
};
