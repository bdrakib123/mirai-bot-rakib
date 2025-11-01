module.exports = function ({ models, api }) {
    const Threads = models.use('Threads');

    async function getInfo(threadID) {
        try {
            const result = await api.getThreadInfo(threadID);
            return result;
        } catch (error) {
            console.error("[Threads:getInfo] ERROR:", error.stack || error.message);
            return null; // Fail gracefully
        }
    }

    async function getAll(...data) {
        let where = {};
        let attributes;
        for (const i of data) {
            if (typeof i !== 'object') throw new Error("getAll: argument must be object or array");
            if (Array.isArray(i)) attributes = i;
            else where = i;
        }
        try {
            const result = await Threads.findAll({ where, attributes });
            return result.map(e => e.get({ plain: true }));
        } catch (error) {
            console.error("[Threads:getAll] ERROR:", error.stack || error.message);
            return [];
        }
    }

    async function getData(threadID) {
        try {
            const data = await Threads.findOne({ where: { threadID } });
            return data ? data.get({ plain: true }) : null;
        } catch (error) {
            console.error("[Threads:getData] ERROR:", error.stack || error.message);
            return null;
        }
    }

    async function createData(threadID, defaults = {}) {
        if (typeof defaults !== 'object' || Array.isArray(defaults)) throw new Error("createData: defaults must be an object");
        try {
            await Threads.findOrCreate({ where: { threadID }, defaults });
            return true;
        } catch (error) {
            console.error("[Threads:createData] ERROR:", error.stack || error.message);
            return false;
        }
    }

    async function setData(threadID, options = {}) {
        if (typeof options !== 'object' || Array.isArray(options)) throw new Error("setData: options must be an object");
        try {
            const record = await Threads.findOne({ where: { threadID } });
            if (record) {
                await record.update(options);
            } else {
                await createData(threadID, options);
            }
            return true;
        } catch (error) {
            console.error("[Threads:setData] ERROR:", error.stack || error.message);
            return false;
        }
    }

    async function delData(threadID) {
        try {
            const record = await Threads.findOne({ where: { threadID } });
            if (record) await record.destroy();
            return true;
        } catch (error) {
            console.error("[Threads:delData] ERROR:", error.stack || error.message);
            return false;
        }
    }

    return {
        getInfo,
        getAll,
        getData,
        setData,
        delData,
        createData
    };
};
