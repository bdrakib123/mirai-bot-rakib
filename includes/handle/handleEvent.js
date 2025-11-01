module.exports = function ({ api, models, Users, Threads, Currencies }) {
    const logger = require("../../utils/log.js");

    // Optimized getText2 creation: Define a helper function to generate getText2 logic
    const createGetText2 = (cmd, threadID, api) => {
        if (cmd.languages && typeof cmd.languages === 'object') {
            return (...values) => {
                const commandModule = cmd.languages || {};
                if (!commandModule.hasOwnProperty(global.config.language)) {
                    // This error message is moved here to be a return value, 
                    // preventing unnecessary message send within the frequently called handler
                    return null; 
                }
                var lang = cmd.languages[global.config.language][values[0]] || '';
                for (var i = values.length; i > 0; i--) { // Fixed loop logic
                    const expReg = RegExp('%' + i, 'g');
                    lang = lang.replace(expReg, values[i]);
                }
                return lang;
            };
        } else {
            return () => {};
        }
    };

    return async function ({ event }) { // Made function async to support await in module execution
        const { allowInbox } = global.config;
        const { userBanned, threadBanned } = global.data;
        const { commands, eventRegistered } = global.client;
        var { senderID, threadID } = event;
        senderID = String(senderID);
        threadID = String(threadID);
        
        if (userBanned.has(senderID) || threadBanned.has(threadID) || (allowInbox == false && senderID == threadID)) return;
        
        for (const eventReg of eventRegistered) {
            const cmd = commands.get(eventReg);

            if (!cmd || !cmd.handleEvent) continue; // Skip if command is missing or handleEvent is not defined

            const getText2 = createGetText2(cmd, threadID, api); // Reuse the factory function
            
            try {
                const Obj = {};
                Obj.event = event;
                Obj.api = api;
                Obj.models = models;
                Obj.Users = Users;
                Obj.Threads = Threads;
                Obj.Currencies = Currencies;
                Obj.getText = getText2;
                
                // Crucial: Use await to prevent event loop blockage if handleEvent is async (which it should be)
                await cmd.handleEvent(Obj); 

            } catch (error) {
                logger(global.getText('handleCommandEvent', 'moduleError', cmd.config.name, error.stack || error.message), 'error');
            }
        }
    };
};
