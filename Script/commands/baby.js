const axios = require("axios");

// Rubish base
const RUBISH_BASE = "https://rubish.online/rubish";
const RUBISH_APIKEY = "rubish69";
const RUBISH_FONT = 0;

module.exports.config = {
  name: "baby",
  version: "2.0.0",
  hasPermssion: 0,
  credits: "hoon",
  description: "Baby bot (full Rubish) — chat / teach / list (and edit/delete best-effort)",
  commandCategory: "simsim",
  usages: "[message/query]",
  cooldowns: 0,
  prefix: false
};

function buildRubishUrl(params = {}) {
  const url = new URL(`${RUBISH_BASE}/simma`);
  // always include apikey and font
  url.searchParams.append("apikey", RUBISH_APIKEY);
  url.searchParams.append("font", String(RUBISH_FONT));
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && String(v).trim() !== "") url.searchParams.append(k, v);
  }
  return url.toString();
}

// Normalize response(s) — prioritize res.data.reply (rubish), fallback to other fields
function normalizeResponsesFromResData(data) {
  // data is res.data
  // If rubish returns { reply: "..." } -> use it
  if (!data) return ["নো রেসপন্স (empty)"];

  // direct reply field
  if (typeof data.reply === "string" && data.reply.trim() !== "") return [data.reply];

  // sometimes API returns array in data.response or data (varies)
  const candidate = (data.response !== undefined) ? data.response : data;
  const arr = Array.isArray(candidate) ? candidate : [candidate];

  const mapped = arr.map(item => {
    if (item === null || item === undefined) return "";
    if (typeof item === "string") return item;
    if (typeof item === "object") {
      // try common keys
      if (typeof item.reply === "string" && item.reply.trim() !== "") return item.reply;
      if (typeof item.message === "string" && item.message.trim() !== "") return item.message;
      if (typeof item.text === "string" && item.text.trim() !== "") return item.text;
      if (typeof item.msg === "string" && item.msg.trim() !== "") return item.msg;
      if (typeof item.output === "string" && item.output.trim() !== "") return item.output;
      // fallback stringify
      try { return JSON.stringify(item); } catch (e) { return String(item); }
    }
    return String(item);
  }).filter(s => s !== undefined && s !== null);

  return mapped.length ? mapped : ["নো রেসপন্স (normalized empty)"];
}

async function callRubish(params = {}) {
  const url = buildRubishUrl(params);
  const res = await axios.get(url);
  // debug log (remove later if you want)
  console.log("RUBISH CALL:", url);
  console.log("RUBISH RES:", JSON.stringify(res.data, null, 2));
  return res.data;
}

module.exports.run = async function ({ api, event, args, Users }) {
  try {
    const uid = event.senderID;
    const senderName = await Users.getNameUser(uid);
    const rawQuery = args.join(" ").trim();
    const query = rawQuery.toLowerCase();

    // no query -> small random reply
    if (!query) {
      const ran = ["Bolo baby", "hum"];
      const r = ran[Math.floor(Math.random() * ran.length)];
      return api.sendMessage(r, event.threadID, (err, info) => {
        if (!err) {
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            type: "simsimi"
          });
        }
      });
    }

    const command = args[0].toLowerCase();

    // ===== Teach via Rubish: teach=QUESTION & reply=ANSWER =====
    if (command === "teach") {
      const parts = rawQuery.replace(/^teach\s*/i, "").split(" - ");
      if (parts.length < 2) return api.sendMessage(" | Use: teach [Question] - [Reply]", event.threadID, event.messageID);

      const [ask, ans] = parts.map(p => p.trim());
      const params = { teach: ask, reply: ans, senderID: uid, senderName };
      const data = await callRubish(params);
      // rubish likely returns a message or reply field
      const out = (data && data.message) ? data.message : (data && data.reply) ? data.reply : JSON.stringify(data);
      return api.sendMessage(String(out), event.threadID, event.messageID);
    }

    // ===== List learned items =====
    if (command === "list") {
      // using list=all
      const data = await callRubish({ list: "all" });
      // If the API returns an array or object, format reasonably for chat
      if (Array.isArray(data)) {
        return api.sendMessage(data.join("\n\n"), event.threadID, event.messageID);
      } else if (data && typeof data === "object") {
        // try common props
        if (data.total || data.totalQuestions || data.count) {
          const summary = `Total: ${data.total || data.totalQuestions || data.count}\n\n${JSON.stringify(data, null, 2)}`;
          return api.sendMessage(summary, event.threadID, event.messageID);
        }
        // otherwise stringify (trim to safe length)
        const out = JSON.stringify(data);
        return api.sendMessage(out.length > 1500 ? out.slice(0, 1400) + " ... (truncated)" : out, event.threadID, event.messageID);
      } else {
        return api.sendMessage(String(data), event.threadID, event.messageID);
      }
    }

    // ===== Remove / Delete (best-effort) =====
    if (["remove", "rm"].includes(command)) {
      const parts = rawQuery.replace(/^(remove|rm)\s*/i, "").split(" - ");
      if (parts.length < 2) return api.sendMessage(" | Use: remove [Question] - [Reply]", event.threadID, event.messageID);
      const [ask, ans] = parts.map(p => p.trim());
      // try possible param names: delete / remove
      const data = await callRubish({ delete: ask, reply: ans, senderID: uid, senderName }); // primary attempt
      // fallback: try remove param
      if (!data || (data && data.error)) {
        const data2 = await callRubish({ remove: ask, reply: ans, senderID: uid, senderName });
        return api.sendMessage(JSON.stringify(data2), event.threadID, event.messageID);
      }
      return api.sendMessage(JSON.stringify(data), event.threadID, event.messageID);
    }

    // ===== Edit (best-effort) =====
    if (command === "edit") {
      const parts = rawQuery.replace(/^edit\s*/i, "").split(" - ");
      if (parts.length < 3) return api.sendMessage(" | Use: edit [Question] - [OldReply] - [NewReply]", event.threadID, event.messageID);
      const [ask, oldReply, newReply] = parts.map(p => p.trim());
      // try possible param names: edit (ask + old + new)
      const data = await callRubish({ edit: ask, old: oldReply, new: newReply, senderID: uid, senderName });
      return api.sendMessage(JSON.stringify(data), event.threadID, event.messageID);
    }

    // ===== Default: chat (text=...) =====
    // Send text + sender info (senderName & senderID)
    const rubData = await callRubish({ text: rawQuery, senderID: uid, senderName });
    const replies = normalizeResponsesFromResData(rubData);
    for (const reply of replies) {
      await new Promise(resolve => {
        api.sendMessage(String(reply), event.threadID, (err, info) => {
          if (!err) {
            global.client.handleReply.push({
              name: module.exports.config.name,
              messageID: info.messageID,
              author: event.senderID,
              type: "rubish"
            });
          }
          resolve();
        }, event.messageID);
      });
    }
  } catch (err) {
    console.error("BABY (rubish) ERROR:", err);
    return api.sendMessage(`| Error in baby (rubish): ${err.message}`, event.threadID, event.messageID);
  }
};

module.exports.handleReply = async function ({ api, event, Users }) {
  try {
    const senderName = await Users.getNameUser(event.senderID);
    const replyText = event.body ? event.body.trim() : "";
    if (!replyText) return;
    const rubData = await callRubish({ text: replyText, senderID: event.senderID, senderName });
    const replies = normalizeResponsesFromResData(rubData);
    for (const reply of replies) {
      await new Promise(resolve => {
        api.sendMessage(String(reply), event.threadID, (err, info) => {
          if (!err) {
            global.client.handleReply.push({
              name: module.exports.config.name,
              messageID: info.messageID,
              author: event.senderID,
              type: "rubish"
            });
          }
          resolve();
        }, event.messageID);
      });
    }
  } catch (err) {
    console.error("HANDLE REPLY (rubish) ERROR:", err);
    return api.sendMessage(` | Error in handleReply: ${err.message}`, event.threadID, event.messageID);
  }
};

module.exports.handleEvent = async function ({ api, event, Users }) {
  try {
    const raw = event.body ? event.body.toLowerCase().trim() : "";
    if (!raw) return;
    const senderName = await Users.getNameUser(event.senderID);
    const senderID = event.senderID;

    // quick keyword replies
    if (
      raw === "baby" || raw === "bot" || raw === "bby" ||
      raw === "jan" || raw === "xan" || raw === "জান" || raw === "বট" || raw === "বেবি"
    ) {
      const greetings = [
        "Bolo baby 💬", "হুম? বলো 😺", "হ্যাঁ জানু 😚", "শুনছি বেবি 😘"
      ];
      const randomReply = greetings[Math.floor(Math.random() * greetings.length)];
      const mention = {
        body: `${randomReply} @${senderName}`,
        mentions: [{ tag: `@${senderName}`, id: senderID }]
      };
      return api.sendMessage(mention, event.threadID, (err, info) => {
        if (!err) {
          global.client.handleReply.push({
            name: module.exports.config.name,
            messageID: info.messageID,
            author: event.senderID,
            type: "rubish"
          });
        }
      }, event.messageID);
    }

    // prefix calls e.g., "baby hello"
    if (raw.startsWith("baby ") || raw.startsWith("bot ") || raw.startsWith("bby ") || raw.startsWith("jan ")) {
      const query = raw.replace(/^baby\s+|^bot\s+|^bby\s+|^jan\s+/i, "").trim();
      if (!query) return;
      const rubData = await callRubish({ text: query, senderID, senderName });
      const replies = normalizeResponsesFromResData(rubData);
      for (const reply of replies) {
        await new Promise(resolve => {
          api.sendMessage(String(reply), event.threadID, (err, info) => {
            if (!err) {
              global.client.handleReply.push({
                name: module.exports.config.name,
                messageID: info.messageID,
                author: event.senderID,
                type: "rubish"
              });
            }
            resolve();
          }, event.messageID);
        });
      }
    }
  } catch (err) {
    console.error("HANDLE EVENT (rubish) ERROR:", err);
    return api.sendMessage(`| Error in handleEvent: ${err.message}`, event.threadID, event.messageID);
  }
};
