module.exports = function ({ models }) {
    const Currencies = models.use('Currencies');

    async function getAll(...data) {
        let where = {};
        let attributes;
        for (const i of data) {
            if (typeof i !== 'object') throw new Error("getAll: argument must be object or array");
            if (Array.isArray(i)) attributes = i;
            else where = i;
        }
        try {
            const result = await Currencies.findAll({ where, attributes });
            return result.map(e => e.get({ plain: true }));
        } catch (error) {
            console.error("[Currencies:getAll] ERROR:", error.stack || error.message);
            return [];
        }
    }

    async function getData(userID) {
        try {
            const data = await Currencies.findOne({ where: { userID } });
            return data ? data.get({ plain: true }) : null;
        } catch (error) {
            console.error("[Currencies:getData] ERROR:", error.stack || error.message);
            return null;
        }
    }

    async function createData(userID, defaults = {}) {
        if (typeof defaults !== 'object' || Array.isArray(defaults)) throw new Error("createData: defaults must be object");
        try {
            await Currencies.findOrCreate({ where: { userID }, defaults });
            return true;
        } catch (error) {
            console.error("[Currencies:createData] ERROR:", error.stack || error.message);
            return false;
        }
    }

    async function setData(userID, options = {}) {
        if (typeof options !== 'object' || Array.isArray(options)) throw new Error("setData: options must be object");
        try {
            const record = await Currencies.findOne({ where: { userID } });
            if (record) await record.update(options);
            else await createData(userID, options);
            return true;
        } catch (error) {
            console.error("[Currencies:setData] ERROR:", error.stack || error.message);
            return false;
        }
    }

    async function delData(userID) {
        try {
            const record = await Currencies.findOne({ where: { userID } });
            if (record) await record.destroy();
            return true;
        } catch (error) {
            console.error("[Currencies:delData] ERROR:", error.stack || error.message);
            return false;
        }
    }

    async function increaseMoney(userID, money) {
        if (typeof money !== 'number') throw new Error("increaseMoney: money must be number");
        try {
            let data = await getData(userID);
            if (!data) await createData(userID, { money });
            else await setData(userID, { money: data.money + money });
            return true;
        } catch (error) {
            console.error("[Currencies:increaseMoney] ERROR:", error.stack || error.message);
            return false;
        }
    }

    async function decreaseMoney(userID, money) {
        if (typeof money !== 'number') throw new Error("decreaseMoney: money must be number");
        try {
            let data = await getData(userID);
            if (!data || data.money < money) return false;
            await setData(userID, { money: data.money - money });
            return true;
        } catch (error) {
            console.error("[Currencies:decreaseMoney] ERROR:", error.stack || error.message);
            return false;
        }
    }

    return {
        getAll,
        getData,
        setData,
        delData,
        createData,
        increaseMoney,
        decreaseMoney
    };
};
