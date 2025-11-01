module.exports = function ({ Users, Threads, Currencies }) {
    const logger = require("../../utils/log.js");
    return async function ({ event }) {
        // Assuming global.data.allUserID, allCurrenciesID, allThreadID, userName are now Maps for O(1) lookup
        const { allUserID, allCurrenciesID, allThreadID, userName, threadInfo } = global.data; 
        const { autoCreateDB } = global.config;
        if (autoCreateDB == false) return; // Simplified boolean check
        var { senderID, threadID } = event;
        senderID = String(senderID);
        threadID = String(threadID);
        try {
            // --- Thread Creation (O(1) Check with Map) ---
            if (!allThreadID.has(threadID) && event.isGroup == true) { // Check with Map.has()
                const threadIn4 = await Threads.getInfo(threadID);

                // --- Thread Data Insertion ---
                const setting = {
                    threadName: threadIn4.threadName,
                    adminIDs: threadIn4.adminIDs,
                    nicknames: threadIn4.nicknames,
                };
                allThreadID.set(threadID, true); // Add to Map for O(1) lookup
                threadInfo.set(threadID, setting); // Cache the info
                
                const setting2 = { threadInfo: setting, data: {} };
                await Threads.setData(threadID, setting2); // DB call 1

                // --- User Creation inside new thread ---
                // Processing user creation in parallel to reduce blocking time (though still within thread creation)
                const userCreationPromises = [];
                for (const singleData of threadIn4.userInfo) {
                    const userID = String(singleData.id);
                    userName.set(userID, singleData.name); // Always update name cache

                    if (!allUserID.has(userID)) { // O(1) Check with Map.has()
                        userCreationPromises.push((async () => {
                            await Users.createData(userID, { 'name': singleData.name, 'data': {} }); // DB call
                            allUserID.set(userID, true); // Add to Map
                            logger(global.getText('handleCreateDatabase', 'newUser', userID), '[ DATABASE ]');
                        })());
                    } else if (userName.get(userID) !== singleData.name) {
                        // Optional: Update name if it changed
                        userCreationPromises.push(Users.setData(userID, { 'name': singleData.name }));
                    }
                }
                await Promise.all(userCreationPromises); // Await all user creation/updates

                logger(global.getText('handleCreateDatabase', 'newThread', threadID), '[ DATABASE ]');
            }
            
            // --- Single User Creation/Update ---
            if (!allUserID.has(senderID)) { // O(1) Check with Map.has()
                const infoUsers = await Users.getInfo(senderID); // API call
                const setting3 = { name: infoUsers.name, data: {} }; // Added data: {} for consistency
                await Users.createData(senderID, setting3) // DB call
                allUserID.set(senderID, true); // Add to Map
                userName.set(senderID, infoUsers.name)
                logger(global.getText('handleCreateDatabase', 'newUser', senderID), '[ DATABASE ]');
            } else if (!userName.has(senderID)) {
                 // Fallback for missing user name cache
                 const infoUsers = await Users.getInfo(senderID);
                 userName.set(senderID, infoUsers.name);
                 await Users.setData(senderID, { name: infoUsers.name });
            }

            // --- Currency Data Creation ---
            if (!allCurrenciesID.has(senderID)) { // O(1) Check with Map.has()
                const setting4 = { data: {} };
                await Currencies.createData(senderID, setting4) // DB call
                allCurrenciesID.set(senderID, true); // Add to Map
            }
            return;
        } catch (err) {
            // Log the error and return silently to prevent crash
            logger(err.stack || err.message, "[ DATABASE ERROR ]");
            return; 
        }
    };
                }
