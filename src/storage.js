const fs = require("fs");

const storageFileName = "../storage.json";

const Storage = {
    Storage() {
        this.load();
    },

    saveOnMessageLevel(message, query, saveObject) {
        let path = query.split(".");
        let targetRoot = this.db.messages[message.id] || Object.create(null);
        let target = targetRoot;

        for (let i = 0; i < path.length; ++i) {
            let p = path[i];

            if (target && Object.prototype.hasOwnProperty.call(target, p)) {
                target = target[p];

                if (i == path.length - 1) {
                    Object.assign(target, saveObject);
                }
            } else {
                if (i == path.length - 1) {
                    target[p] = saveObject;
                } else {
                    target[p] = Object.create(null);
                    target = target[p];
                }
            }
        }

        this.db.messages[message.id] = targetRoot;
    },
    getFromMessageLevel(message, query, isCreate = false, defaultValue = Object.create(null)) {
        let path = query.split(".");
        let result = this.db.message[message.id];

        for (let i = 0; i < path.length; ++i) {
            let p = path[i];

            if (result && Object.prototype.hasOwnProperty.call(result, p)) {
                result = result[p];
            } else {
                if (isCreate) {
                    if (!result) {
                        result = Object.create(null);
                    }

                    result[p] = (i == path.length - 1) ? defaultValue : Object.create(null);
                    result = result[p];
                } else {
                    return undefined;
                }
            }
        }

        return result;
    },

    saveOnUserLevel(user, query, saveObject) {
        let path = query.split(".");
        let targetRoot = this.db.users[user.id] || Object.create(null);
        let target = targetRoot;

        for (let i = 0; i < path.length; ++i) {
            let p = path[i];

            if (target && Object.prototype.hasOwnProperty.call(target, p)) {
                target = target[p];

                if (i == path.length - 1) {
                    Object.assign(target, saveObject);
                }
            } else {
                if (i == path.length - 1) {
                    target[p] = saveObject;
                } else {
                    target[p] = Object.create(null);
                    target = target[p];
                }
            }
        }

        this.db.users[user.id] = targetRoot;
    },
    getFromUserLevel(user, query, isCreate = false, defaultValue = Object.create(null)) {
        let path = query.split(".");
        let result = this.db.users[user.id];

        for (let i = 0; i < path.length; ++i) {
            let p = path[i];

            if (result && Object.prototype.hasOwnProperty.call(result, p)) {
                result = result[p];
            } else {
                if (isCreate) {
                    if (!result) {
                        result = Object.create(null);
                    }

                    result[p] = (i == path.length - 1) ? defaultValue : Object.create(null);
                    result = result[p];
                } else {
                    return undefined;
                }
            }
        }

        return result;
    },

    saveOnChannelLevel(channel, query, saveObject) {
        let path = query.split(".");
        let targetRoot = this.db.channels[channel.id] || Object.create(null);
        let target = targetRoot;

        for (let i = 0; i < path.length; ++i) {
            let p = path[i];

            if (target && Object.prototype.hasOwnProperty.call(target, p)) {
                target = target[p];

                if (i == path.length - 1) {
                    Object.assign(target, saveObject);
                }
            } else {
                if (i == path.length - 1) {
                    target[p] = saveObject;
                } else {
                    target[p] = Object.create(null);
                    target = target[p];
                }
            }
        }

        this.db.channels[channel.id] = targetRoot;
    },
    getFromChannelLevel(channel, query, isCreate = false, defaultValue = Object.create(null)) {
        let path = query.split(".");
        let result = this.db.channels[channel.id];

        for (let i = 0; i < path.length; ++i) {
            let p = path[i];

            if (result && Object.prototype.hasOwnProperty.call(result, p)) {
                result = result[p];
            } else {
                if (isCreate) {
                    if (!result) {
                        result = Object.create(null);
                    }

                    result[p] = (i == path.length - 1) ? defaultValue : Object.create(null);
                    result = result[p];
                } else {
                    return undefined;
                }
            }
        }

        return result;
    },

    saveOnGuildLevel(guild, query, saveObject) {
        let path = query.split(".");
        let targetRoot = this.db.guilds[guild.id] || Object.create(null);
        let target = targetRoot;

        for (let i = 0; i < path.length; ++i) {
            let p = path[i];

            if (target && Object.prototype.hasOwnProperty.call(target, p)) {
                target = target[p];

                if (i == path.length - 1) {
                    Object.assign(target, saveObject);
                }
            } else {
                if (i == path.length - 1) {
                    target[p] = saveObject;
                } else {
                    target[p] = Object.create(null);
                    target = target[p];
                }
            }
        }

        this.db.guilds[guild.id] = targetRoot;
    },
    getFromGuildLevel(guild, query, isCreate = false, defaultValue = Object.create(null)) {
        let path = query.split(".");
        let result = this.db.guilds[guild.id];

        for (let i = 0; i < path.length; ++i) {
            let p = path[i];

            if (result && Object.prototype.hasOwnProperty.call(result, p)) {
                result = result[p];
            } else {
                if (isCreate) {
                    if (!result) {
                        result = Object.create(null);
                    }

                    result[p] = (i == path.length - 1) ? defaultValue : Object.create(null);
                    result = result[p];
                } else {
                    return undefined;
                }
            }
        }

        return result;
    },

    persist() {
        fs.writeFile(storageFileName, JSON.stringify(this.db),
            function persistError(err) {
                console.error(`Error while persisting storage: ${err}`);
            });
    },
    load() {
        fs.exists(storageFileName,
            function storageExists(exists) {
                if (exists) {
                    fs.readFile(storageFileName,
                        function storageReadError(err, data) {
                            if (err) {
                                console.error(`Error while reading persistence storage: ${err}`);
                                this.db = {
                                    users: Object.create(null),
                                    messages: Object.create(null),
                                    channels: Object.create(null),
                                    guilds: Object.create(null)
                                };
                                Object.setPrototypeOf(this.db, null);
                                return;
                            }

                            this.db = JSON.parse(data);
                        }
                    );
                } else {
                    this.db = {
                        users: Object.create(null),
                        messages: Object.create(null),
                        channels: Object.create(null),
                        guilds: Object.create(null)
                    };
                    Object.setPrototypeOf(this.db, null);
                }
            }.bind(this));
    }

};

module.exports = Storage;