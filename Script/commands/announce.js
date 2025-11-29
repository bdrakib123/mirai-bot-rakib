const fs = require('fs-extra');

module.exports.config = {
  name: "announce",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "Rakib Hasan",
  description: "Send a message to all groups where the bot is present (robust & debug)",
  commandCategory: "Admin",
  usages: "reply or announce <message>",
  cooldowns: 5
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function safeStringifyError(err) {
  try {
    if (!err) return 'Unknown error (no error object)';
    if (err.message) return err.message;
    return typeof err === 'string' ? err : JSON.stringify(err);
  } catch (e) {
    return String(err);
  }
}

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID, messageReply } = event;

  // ---- CONFIG ----
  const ownerIDs = ["61581351693349"]; // তোমার UID (প্রয়োজনে multiple বসাতে পারো)
  const delayBetween = 600; // ms
  // -----------------

  // permission check
  if (!ownerIDs.includes(String(senderID))) {
    return api.sendMessage("❌ এই কমান্ড শুধু বট Owner ব্যবহার করতে পারবে।", threadID, messageID);
  }

  // get message content
  let content = "";
  if (messageReply && messageReply.body && messageReply.body.trim()) {
    content = messageReply.body.trim();
  } else if (args && args.length > 0) {
    content = args.join(" ").trim();
  }

  if (!content) {
    return api.sendMessage("❌ পাঠানোর জন্য message লিখো বা কোনো message-এ reply করো।", threadID, messageID);
  }

  try {
    // Try multiple ways to fetch thread list (some Miari forks differ)
    let threads = [];
    let fetched = false;

    // 1) try callback style api.getThreadList(limit, before, cb)
    try {
      threads = await new Promise((resolve, reject) => {
        try {
          api.getThreadList(100, null, (err, list) => {
            if (err) return reject(err);
            return resolve(list || []);
          });
        } catch (e) {
          // if this throws, fallback to reject
          return reject(e);
        }
      });
      fetched = true;
      console.log('[announce] fetched threads via getThreadList(limit, null, cb)');
    } catch (err1) {
      console.log('[announce] getThreadList callback-style failed:', safeStringifyError(err1));
    }

    // 2) try promise-style getThreadList if available
    if (!fetched) {
      try {
        if (typeof api.getThreadList === 'function') {
          // some libs return promise if no callback provided
          const maybePromise = api.getThreadList(100, null);
          if (maybePromise && typeof maybePromise.then === 'function') {
            threads = await maybePromise;
            fetched = true;
            console.log('[announce] fetched threads via getThreadList promise-style');
          }
        }
      } catch (err2) {
        console.log('[announce] getThreadList promise-style failed:', safeStringifyError(err2));
      }
    }

    // 3) try other common variations
    if (!fetched) {
      try {
        if (typeof api.getThreadListAsync === 'function') {
          threads = await api.getThreadListAsync(100, 0);
          fetched = true;
          console.log('[announce] fetched threads via getThreadListAsync');
        } else if (typeof api.getThreadListPromise === 'function') {
          threads = await api.getThreadListPromise(100, 0);
          fetched = true;
          console.log('[announce] fetched threads via getThreadListPromise');
        }
      } catch (err3) {
        console.log('[announce] alternative getThreadList methods failed:', safeStringifyError(err3));
      }
    }

    // 4) final fallback: try api.getThreads (some forks)
    if (!fetched) {
      try {
        if (typeof api.getThreads === 'function') {
          threads = await new Promise((resolve, reject) => {
            api.getThreads(100, null, (err, list) => {
              if (err) return reject(err);
              resolve(list || []);
            });
          });
          fetched = true;
          console.log('[announce] fetched threads via getThreads');
        }
      } catch (err4) {
        console.log('[announce] getThreads failed:', safeStringifyError(err4));
      }
    }

    if (!fetched) {
      throw new Error('Unable to fetch thread list: no supported getThreadList/getThreads method found or all attempts failed.');
    }

    // ensure threads is array
    threads = Array.isArray(threads) ? threads : (threads && threads.threads ? threads.threads : []);
    if (!Array.isArray(threads)) threads = [];

    // filter groups
    const groupThreads = (threads || []).filter(t => {
      if (!t) return false;
      if (t.isGroup === true) return true;
      if (t.threadID && String(t.threadID).startsWith("g_")) return true;
      if (Array.isArray(t.participantIDs) && t.participantIDs.length > 2) return true;
      if (Array.isArray(t.participants) && t.participants.length > 2) return true;
      // sometimes thread objects have 'type' or 'is_group'
      if (t.is_group === true || t.type === 'group') return true;
      return false;
    });

    if (!groupThreads.length) {
      return api.sendMessage("⚠️ কোনো গ্রুপ পাওয়া যায়নি যেখানে বট আছে।", threadID, messageID);
    }

    let success = 0;
    let failed = 0;

    // send starting progress (best-effort)
    try {
      await new Promise((res) => api.sendMessage(`📢 Announcement শুরু... মোট গ্রুপ: ${groupThreads.length}`, threadID, () => res()));
    } catch (e) {
      // ignore
      console.log('[announce] failed to send start progress:', safeStringifyError(e));
    }

    // loop and send
    for (const g of groupThreads) {
      const targetThreadID = g.threadID || g.id || g.threadId || g.thread_id;
      if (!targetThreadID) continue;

      try {
        // Some APIs expect (message, threadID, callback) and return nothing; some return a Promise.
        const sendArgs = { body: content };
        // try promise style first
        if (api.sendMessage.length === 3) {
          // signature likely sendMessage(message, threadID, callback)
          await new Promise((resolve) => api.sendMessage(sendArgs, targetThreadID, () => resolve()));
        } else {
          // try promise style
          await api.sendMessage(sendArgs, targetThreadID);
        }
        success++;
      } catch (eSend) {
        console.log(`[announce] failed to send to ${targetThreadID}:`, safeStringifyError(eSend));
        failed++;
      }

      await sleep(delayBetween);
    }

    // final summary
    await new Promise((res) => api.sendMessage(
      `✅ Announcement Complete!\nসফল: ${success}\nব্যর্থ: ${failed}\nমোট: ${groupThreads.length}`,
      threadID,
      () => res()
    ));

  } catch (error) {
    // safe stringify error (no more undefined)
    const errText = safeStringifyError(error);
    console.error('[announce] fatal error:', errText, error);
    return api.sendMessage(`❌ Announcement ব্যর্থ হয়েছে।\nError: ${errText}`, threadID, messageID);
  }
};
