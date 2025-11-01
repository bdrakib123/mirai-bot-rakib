module.exports = function ({ api, models, Users, Threads, Currencies }) {
    
    // Optimized getText2 creation: Define a factory function
    const createGetText2 = (handleNeedExec, threadID, messageID, api) => {
        if (handleNeedExec.languages && typeof handleNeedExec.languages === 'object') {
            return (...value) => {
                const languageModule = handleNeedExec.languages || {};
                if (!languageModule.hasOwnProperty(global.config.language)) {
                    // Send error message to chat if language is missing (handled here to avoid repeated code)
                    // **Fixed:** Used messageID instead of incorrect messengeID
                    api.sendMessage(global.getText('handleCommand', 'notFoundLanguage', handleNeedExec.config.name), threadID, messageID); 
                    return null; 
                }
                var lang = handleNeedExec.languages[global.config.language][value[0]] || '';
                for (var i = value.length; i > 0; i--) { // Fixed loop logic
                    const expReg = RegExp('%' + i, 'g');
                    lang = lang.replace(expReg, value[i]);
                }
                return lang;
            };
        } else {
            return () => {};
        }
    };

    return async function ({ event }) { // Made function async
        if (!event.messageReply) return;
        
        const { handleReply, commands } = global.client; // Assuming handleReply is now a Map
        const { messageID, threadID, messageReply } = event;

        // --- O(1) Check with Map (Crucial Optimization) ---
        const indexOfMessage = handleReply.get(messageReply.messageID);
        if (!indexOfMessage) return;

        const handleNeedExec = commands.get(indexOfMessage.name);
        if (!handleNeedExec || !handleNeedExec.handleReply) {
             // Clean up if command is missing
             handleReply.delete(messageReply.messageID);
             return api.sendMessage(global.getText('handleReply', 'missingValue'), threadID, messageID);
        }

        try {
            const getText2 = createGetText2(handleNeedExec, threadID, messageID, api); // Reuse the factory function
            if (getText2 === null) return; // Language not found error handled inside factory

            const Obj = {};
            Obj.api = api
            Obj.event = event 
            Obj.models = models
            Obj.Users = Users
            Obj.Threads = Threads 
            Obj.Currencies = Currencies
            Obj.handleReply = indexOfMessage
            Obj.getText = getText2
            
            // Crucial: Use await to prevent event loop blockage
            await handleNeedExec.handleReply(Obj); 

        } catch (error) {
            // Log the error and send a simple error message to the user
            logger(global.getText('handleReply', 'executeError', error.stack || error.message), "error");
            return api.sendMessage(global.getText('handleReply', 'executeError', "An unexpected error occurred."), threadID, messageID);
        }
    };
            }
