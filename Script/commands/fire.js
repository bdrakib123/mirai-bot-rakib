// fire.js
const fs = require("fs");
const path = require("path");
const HOON_UID = "61581351693349";
const DATA_FILE = path.join(__dirname, "fireMode.json");

module.exports.config = {
  name: "fire",
  version: "2.0.0",
  permission: 0,
  credits: "HOON x ChatGPT",
  description: "Cinematic Fire Mode 🔥 (Only HOON can toggle)",
  prefix: true,
};

module.exports.run = async function ({ api, event, args }) {
  const sender = event.senderID;
  const thread = event.threadID;
  const sub = (args[0] || "").toLowerCase();

  // 🔒 প্রজা হলে কিছুই করবে না (reply ও না)
  if (sender !== HOON_UID) return;

  // আগের মোড স্টেট পড়া
  let state = { enabled: false };
  if (fs.existsSync(DATA_FILE)) {
    try {
      state = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    } catch {
      state = { enabled: false };
    }
  }

  // 🔥 ফায়ার ON করা হলে
  if (sub === "on") {
    if (state.enabled)
      return api.sendMessage("ফায়ার মোড ইতিমধ্যে ON আছে 🔥", thread);

    state.enabled = true;
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));

    // cinematic মেসেজ লিস্ট
    const fireMessages = [
      "🔥 সতর্কতা! ফায়ার মোড চালু হচ্ছে...",
      "⚙️ সিস্টেম পাওয়ার 9000+ এ পৌঁছেছে!",
      "😈 সব প্রজা সাবধান! আগুনে জ্বলবে পুরো চ্যাট!",
      "💀 HOON আগুন ছেড়ে দিয়েছে...",
      "🔥 ফায়ার মোড সক্রিয় ✅\nSystem Temperature: 999°C 🌋",
    ];

    // টাইমড মেসেজ পাঠানো
    fireMessages.forEach((msg, i) => {
      setTimeout(() => api.sendMessage(msg, thread), i * 1500); // প্রতি 1.5 সেকেন্ডে একবার
    });

    return;
  }

  // ❄️ ফায়ার OFF করা হলে
  if (sub === "off") {
    if (!state.enabled)
      return api.sendMessage("ফায়ার মোড ইতিমধ্যে OFF আছে 🧊", thread);

    state.enabled = false;
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));

    const coolMessages = [
      "🧊 ফায়ার মোড বন্ধ করা হচ্ছে...",
      "💧 তাপমাত্রা নেমে আসছে ধীরে ধীরে...",
      "😮‍💨 আগুন নিভে গেছে, শান্তি ফিরে এসেছে 🌙",
      "🪫 HOON আগুন বন্ধ করেছে। System cool mode সক্রিয় ❄️",
      "🧘‍♂️ চ্যাটে এখন ঠাণ্ডা হাওয়া বইছে…",
    ];

    coolMessages.forEach((msg, i) => {
      setTimeout(() => api.sendMessage(msg, thread), i * 1500);
    });

    return;
  }

  // শুধু ".fire" দিলে স্ট্যাটাস দেখানো
  api.sendMessage(
    `ফায়ার মোড বর্তমানে ${state.enabled ? "🔥 ON" : "🧊 OFF"} অবস্থায় আছে।`,
    thread
  );
};
