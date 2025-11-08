// ==================== quizbn.js ====================

const axios = require("axios");
const fs = require("fs");
const path = require("path");

const scoreFile = path.join(__dirname, "quizbn_score.json");
let scores = fs.existsSync(scoreFile) ? JSON.parse(fs.readFileSync(scoreFile)) : {};

module.exports.config = {
  name: "quizbn",
  version: "4.1.0",
  hasPermission: 0,
  credits: "Hoon",
  description: "বাংলা কুইজ (MCQ + True/False + Timer + Leaderboard)",
  commandCategory: "fun",
  usages: ".quizbn | .quizbn ans | .quizbn score | .quizbn top",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const sender = event.senderID;

  // ===== স্কোর দেখার কমান্ড =====
  if (args[0] && args[0].toLowerCase() === "score") {
    const score = scores[sender] || 0;
    return api.sendMessage(`🏆 তোমার বর্তমান স্কোর: ${score} পয়েন্ট`, event.threadID, event.messageID);
  }

  // ===== লিডারবোর্ড =====
  if (args[0] && args[0].toLowerCase() === "top") {
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]).slice(0, 10);
    if (sorted.length === 0) return api.sendMessage("📊 এখনও কেউ কুইজ খেলেনি!", event.threadID, event.messageID);

    let msg = "🏆 বাংলা কুইজ লিডারবোর্ড 🏆\n━━━━━━━━━━━━━━━\n";
    for (let i = 0; i < sorted.length; i++) {
      const [id, score] = sorted[i];
      const userName = (await api.getUserInfo(id))[id]?.name || "অজানা ইউজার";
      msg += `${i + 1}. ${userName} — ${score} পয়েন্ট\n`;
    }
    msg += "━━━━━━━━━━━━━━━\n© ক্রেডিট: Hoon";
    return api.sendMessage(msg, event.threadID, event.messageID);
  }

  // ===== উত্তর দেখা =====
  if (args[0] && args[0].toLowerCase() === "ans") {
    const correctAnswer = global.quizbnData?.[sender]?.answer;
    if (!correctAnswer) return api.sendMessage("❗ আগে একটি কুইজ প্রশ্ন নাও `.quizbn` লিখে!", event.threadID, event.messageID);
    api.sendMessage(`✅ সঠিক উত্তর হলো: ${correctAnswer}`, event.threadID, event.messageID);
    delete global.quizbnData[sender];
    return;
  }

  // ===== নতুন কুইজ আনা =====
  try {
    const res = await axios.get("https://mahbub-ullash.cyberbot.top/api/bangla-quiz");
    const data = res.data.message;
    if (!data || !data.question) return api.sendMessage("⚠️ কুইজ প্রশ্ন আনতে সমস্যা হয়েছে!", event.threadID, event.messageID);

    let quizText;
    const isTrueFalse = !data.B && !data.C && !data.D;

    if (isTrueFalse) {
      quizText = `🎯 বাংলা কুইজ (True/False)
━━━━━━━━━━━━━━━
❓ প্রশ্ন: ${data.question}

✅ True
❌ False
━━━━━━━━━━━━━━━
⏰ সময়: 30 সেকেন্ড
📩 উত্তর জানতে লেখো: .quizbn ans
📚 মোট প্রশ্ন: ${data.totalQuestions}
👤 লেখক: ${data.author.name}
━━━━━━━━━━━━━━━
© ক্রেডিট: Hoon`;
    } else {
      quizText = `🎯 বাংলা কুইজ
━━━━━━━━━━━━━━━
❓ প্রশ্ন: ${data.question}

A️⃣ ${data.A}
B️⃣ ${data.B}
C️⃣ ${data.C}
D️⃣ ${data.D}
━━━━━━━━━━━━━━━
⏰ সময়: 30 সেকেন্ড
📩 উত্তর জানতে লেখো: .quizbn ans
📚 মোট প্রশ্ন: ${data.totalQuestions}
👤 লেখক: ${data.author.name}
━━━━━━━━━━━━━━━
© ক্রেডিট: Hoon`;
    }

    global.quizbnData = global.quizbnData || {};
    // প্রতিটি ইউজারের জন্য আলাদা অবজেক্ট
    global.quizbnData[sender] = { answer: data.answer, active: true };

    api.sendMessage(quizText, event.threadID, (err, info) => {
      if (!err) {
        global.client.handleReply.push({
          type: "quizbn_reply",
          name: "quizbn",
          author: sender,
          correct: data.answer,
          messageID: info.messageID
        });

        // টাইমার (৩০ সেকেন্ড)
        setTimeout(() => {
          const quiz = global.quizbnData[sender];
          if (quiz && quiz.active) {
            api.sendMessage(`⏰ সময় শেষ!\nসঠিক উত্তর হলো: ${data.answer}`, event.threadID);
            delete global.quizbnData[sender];
          }
        }, 30000);
      }
    });
  } catch (err) {
    return api.sendMessage("🚫 কিছু একটা ভুল হয়েছে, API থেকে তথ্য আনা যায়নি!", event.threadID, event.messageID);
  }
};

// ===== ইউজারের রিপ্লাই =====
module.exports.handleReply = async function ({ api, event, handleReply }) {
  if (handleReply.type !== "quizbn_reply") return;
  const sender = event.senderID;
  const userAnswer = event.body.trim().toUpperCase();
  const correctAnswer = handleReply.correct.toUpperCase();

  const quiz = global.quizbnData?.[sender];
  if (!quiz || !quiz.active) return; // সময় শেষ হলে বা উত্তর হয়ে গেলে skip

  let reply;
  if (userAnswer === correctAnswer) {
    reply = "✅ একদম ঠিক বলেছো! 🎉 +1 পয়েন্ট 🎯";
    scores[sender] = (scores[sender] || 0) + 1;
  } else {
    reply = `❌ ভুল উত্তর!\nসঠিক উত্তর হলো: ${correctAnswer}`;
  }

  // উত্তর হয়ে গেলে deactivate
  quiz.active = false;
  fs.writeFileSync(scoreFile, JSON.stringify(scores, null, 2));
  api.sendMessage(reply, event.threadID, event.messageID);

  // ২ সেকেন্ড পর ডেটা ক্লিন
  setTimeout(() => delete global.quizbnData[sender], 2000);
};
