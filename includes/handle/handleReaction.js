module.exports = function ({ api, models, Users, Threads, Currencies }) {
    return function ({ event }) {
        if (!event.messageID) return;
        const { handleReaction, commands } = global.client;
        const { messageID, threadID } = event;
        if (!handleReaction || handleReaction.length === 0) return;

        const index = handleReaction.findIndex(e => e.messageID === messageID);
        if (index < 0) return;

        const handleInfo = handleReaction[index];
        const command = commands.get(handleInfo.name);
        if (!command) return api.sendMessage(global.getText('handleReaction', 'missingValue'), threadID, messageID);

        const getText = (...values) => {
            if (!command.languages?.[global.config.language]) return '';
            let text = command.languages[global.config.language][values[0]] || '';
            for (let i = 0; i < values.length; i++) text = text.replace(new RegExp(`%${i + 1}`, 'g'), values[i]);
            return text;
        };

        try {
            command.handleReaction({ api, event, models, Users, Threads, Currencies, handleReaction: handleInfo, getText });
        } catch (error) {
            return api.sendMessage(global.getText('handleReaction', 'executeError', String(error)), threadID, messageID);
        }
    };
};
