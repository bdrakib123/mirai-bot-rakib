module.exports = function ({ api, models, Users, Threads, Currencies }) {
    const logger = require("../../utils/log.js");

    return function ({ event }) {
        const { handleReaction, commands } = global.client;
        const { messageID, threadID } = event;
        const lang = global.config.language;

        // যদি handleReaction খালি থাকে বা messageID না থাকে, return
        if (!handleReaction || handleReaction.length === 0) return;

        const indexOfHandle = handleReaction.findIndex(e => e.messageID == messageID);
        if (indexOfHandle < 0) return;

        const handleInfo = handleReaction[indexOfHandle];
        const command = commands.get(handleInfo.name);
        if (!command) {
            return api.sendMessage(global.getText('handleReaction', 'missingValue'), threadID, messageID);
        }

        // getText2 function তৈরি
        let getText2 = () => '';
        if (command.languages && typeof command.languages === 'object') {
            getText2 = (...values) => {
                const cmdLang = command.languages[lang];
                if (!cmdLang) return `[Error] Language ${lang} not found for command ${command.config.name}`;
                let text = cmdLang[values[0]] || '';
                for (let i = 0; i < values.length; i++) {
                    const regex = new RegExp(`%${i + 1}`, 'g');
                    text = text.replace(regex, values[i]);
                }
                return text;
            };
        }

        try {
            const Obj = {
                api,
                event,
                models,
                Users,
                Threads,
                Currencies,
                handleReaction: handleInfo,
                getText: getText2
            };

            // Reaction execute
            command.handleReaction(Obj);
        } catch (error) {
            logger(`[Reaction Error] Command: ${command.config.name}, Error: ${error}`, 'error');
            return api.sendMessage(global.getText('handleReaction', 'executeError', String(error)), threadID, messageID);
        }
    };
};
