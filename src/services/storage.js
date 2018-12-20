const defaultDbObject = {
    users: Object.create(null),
    messages: Object.create(null),
    channels: Object.create(null),
    guilds: Object.create(null)
};
Object.setPrototypeOf(defaultDbObject, null);

// TODO: deprecate this in favor of SQLite settings provider
const Storage = {
    Storage() {
        this.db = Object.assign(Object.create(null), defaultDbObject);
    },

    saveOnMessageLevel(message, query, saveObject) {
        this._save(this.db.messages, message, query, saveObject);
    },
    getFromMessageLevel(message, query, isCreate = false, defaultValue = Object.create(null)) {
        return this._get(this.db.messages, message, query, isCreate, defaultValue);
    },

    saveOnUserLevel(user, query, saveObject) {
        this._save(this.db.users, user, query, saveObject);
    },
    getFromUserLevel(user, query, isCreate = false, defaultValue = Object.create(null)) {
        return this._get(this.db.users, user, query, isCreate, defaultValue);
    },

    saveOnChannelLevel(channel, query, saveObject) {
        this._save(this.db.channels, channel, query, saveObject);
    },
    getFromChannelLevel(channel, query, isCreate = false, defaultValue = Object.create(null)) {
        return this._get(this.db.channels, channel, query, isCreate, defaultValue);
    },

    saveOnGuildLevel(guild, query, saveObject) {
        this._save(this.db.guilds, guild, query, saveObject);
    },
    getFromGuildLevel(guild, query, isCreate = false, defaultValue = Object.create(null)) {
        return this._get(this.db.guilds, guild, query, isCreate, defaultValue);
    },

    _save(level, idObj, query, saveObject) {
        let path = query.split(".");

        if (!level[idObj.id]) {
            level[idObj.id] = Object.create(null);
        }
        let target = level[idObj.id];

        for (let i = 0; i < path.length; ++i) {
            let p = path[i];

            if (target && p in target) {
                if (i === path.length - 1) {
                    if (typeof saveObject === "object") {
                        Object.assign(target[p], saveObject);
                    } else {
                        target[p] = saveObject;
                    }
                } else {
                    target = target[p];
                }
            } else {
                if (i === path.length - 1) {
                    target[p] = saveObject;
                } else {
                    target[p] = Object.create(null);
                    target = target[p];
                }
            }
        }

        //level[idObj.id] = targetRoot;
    },

    _get(level, idObj, query, isCreate, defaultValue) {
        let path = query.split(".");

        if (!level[idObj.id]) {
            level[idObj.id] = Object.create(null);
        }
        let result = level[idObj.id];

        for (let i = 0; i < path.length; ++i) {
            let p = path[i];

            if (result && p in result) {
                result = result[p];
            } else {
                if (isCreate) {
                    if (!result) {
                        result = Object.create(null);
                    }

                    result[p] = (i === path.length - 1) ? defaultValue : Object.create(null);
                    result = result[p];
                } else {
                    return undefined;
                }
            }
        }

        return result;
    }
};

module.exports = Storage;