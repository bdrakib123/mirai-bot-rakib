// handleReaction.js

module.exports = function ({ api, models, Users, Threads, Currencies }) {
    return function ({ event }) {
        const { handleReaction, commands } = global.client || {};
        if (!handleReaction || !Array.isArray(handleReaction) || handleReaction.length === 0) return;

        const { messageID, threadID, userID } = event;

        // 🔒 বট নিজের রিয়্যাকশন ইগনোর করবে
        if (userID == api.getCurrentUserID()) return;

        // এই messageID-টার জন্য আগে কোন handleReaction সেভ করা ছিল কিনা চেক করি
        const indexOfHandle = handleReaction.findIndex(e => e.messageID == messageID);
        if (indexOfHandle < 0) return;

        const savedData = handleReaction[indexOfHandle];
        const handleNeedExec = commands.get(savedData.name);

        // ওই কমান্ড নাহ পেলে এরর পাঠাই
        if (!handleNeedExec)
            return api.sendMessage(
                global.getText('handleReaction', 'missingValue'),
                threadID,
                messageID
            );

        try {
            // 🔤 multi-language getText সেটআপ
            let getText2 = () => {};
            if (handleNeedExec.languages && typeof handleNeedExec.languages === 'object') {
                getText2 = (...value) => {
                    const langPack = handleNeedExec.languages || {};

                    // config এ সেট করা ভাষা নাই
                    if (!langPack.hasOwnProperty(global.config.language)) {
                        return api.sendMessage(
                            global.getText('handleCommand', 'notFoundLanguage', handleNeedExec.config.name),
                            threadID,
                            messageID
                        );
                    }

                    // value[0] = key, বাকি গুলো argument
                    let lang = langPack[global.config.language][value[0]] || '';

                    // %1, %2, %3 টাইপ প্লেসহোল্ডার রিপ্লেস
                    for (let i = 1; i < value.length; i++) {
                        const expReg = new RegExp('%' + i, 'g');
                        lang = lang.replace(expReg, value[i]);
                    }

                    return lang;
                };
            }

            // অবজেক্ট বানায় handleReaction ফাংশনে পাঠাই
            const Obj = {
                api,
                event,
                models,
                Users,
                Threads,
                Currencies,
                handleReaction: savedData,
                getText: getText2
            };

            // কমান্ডের ভিতরের handleReaction রান
            handleNeedExec.handleReaction(Obj);
            return;
        } catch (error) {
            return api.sendMessage(
                global.getText('handleReaction', 'executeError', error),
                threadID,
                messageID
            );
        }
    };
};
