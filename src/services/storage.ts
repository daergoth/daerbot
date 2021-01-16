import { Guild, Message, Snowflake, TextChannel, User } from "discord.js";

class InnerRecord extends Map<string, InnerObject> {}

type InnerObject = InnerRecord | any;

interface IDObject {
    id: Snowflake
}

interface DatabaseObject {
    users: Map<Snowflake, InnerObject>;
    messages: Map<Snowflake, InnerObject>;
    channels: Map<Snowflake, InnerObject>;
    guilds: Map<Snowflake, InnerObject>;
};

enum DatabaseLevel {
    MESSAGE,
    USER,
    CHANNEL,
    GUILD
}

// tslint:disable-next-line: max-classes-per-file
export class DiscordBasedStorage {

    private static instance: DiscordBasedStorage;

    private db: DatabaseObject;

    private constructor() {
        const defaultDbObject: DatabaseObject = {
            users: new Map<Snowflake, InnerObject>(),
            messages: new Map<Snowflake, InnerObject>(),
            channels: new Map<Snowflake, InnerObject>(),
            guilds: new Map<Snowflake, InnerObject>()
        };
        Object.setPrototypeOf(defaultDbObject, null);

        this.db = defaultDbObject;
    }

    public static getInstance(): DiscordBasedStorage {
        if (!this.instance) {
            this.instance = new DiscordBasedStorage();
        }
        return this.instance;
    }

    public getFromMessageLevel(message: Message, query: string, isCreate = false, defaultValue = Object.create(null)) {
        return this.get(DatabaseLevel.MESSAGE, message, query, isCreate, defaultValue);
    }

    public getFromUserLevel(user: User, query: string, isCreate = false, defaultValue = Object.create(null)) {
        return this.get(DatabaseLevel.USER, user, query, isCreate, defaultValue);
    }

    public getFromChannelLevel(channel: TextChannel, query: string, isCreate = false, defaultValue = Object.create(null)) {
        return this.get(DatabaseLevel.CHANNEL, channel, query, isCreate, defaultValue);
    }

    public getFromGuildLevel(guild: Guild, query: string, isCreate = false, defaultValue = Object.create(null)) {
        return this.get(DatabaseLevel.GUILD, guild, query, isCreate, defaultValue);
    }

    public saveOnMessageLevel(message: Message, query: string, saveObject) {
        this.save(DatabaseLevel.MESSAGE, message, query, saveObject);
    }

    public saveOnUserLevel(user: User, query: string, saveObject) {
        this.save(DatabaseLevel.USER, user, query, saveObject);
    }

    public saveOnChannelLevel(channel: TextChannel, query: string, saveObject) {
        this.save(DatabaseLevel.CHANNEL, channel, query, saveObject);
    }

    public saveOnGuildLevel(guild: Guild, query: string, saveObject) {
        this.save(DatabaseLevel.GUILD, guild, query, saveObject);
    }

    private get(levelEnum: DatabaseLevel, idObj: IDObject, query: string, isCreate: boolean, defaultValue) {
        const id = idObj.id;
        const path = query.split(".");

        const levelObject = this.getLevelObject(levelEnum);

        if (!levelObject.has(id)) {
            levelObject.set(id, new InnerRecord());
        }

        let result = levelObject.get(id);

        for (let i = 0; i < path.length; ++i) {
            const p = path[i];

            if (result && result.has(p)) {
                result = result.get(p);
            } else {
                if (isCreate) {
                    if (!result) {
                        result = new InnerRecord();
                    }

                    result.set(p, (i === path.length - 1) ? defaultValue : new InnerRecord())
                    result = result.get(p);
                } else {
                    return undefined;
                }
            }
        }

        if (result instanceof InnerRecord) {
            const tmp = Object.create(null);
            result.forEach((val, key) => tmp[key] = val);
            result = tmp;
        }
        return result;
    }

    private save(levelEnum: DatabaseLevel, idObj: IDObject, query: string, saveObject) {
        const id = idObj.id;
        const path = query.split(".");

        const levelObject = this.getLevelObject(levelEnum);

        if (!levelObject.has(id)) {
            levelObject.set(id, new InnerRecord());
        }

        let target = levelObject.get(id);

        for (let i = 0; i < path.length; ++i) {
            const p = path[i];

            if (target && target.has(p)) {
                if (i === path.length - 1) {
                    if (saveObject instanceof Map) {
                        const tmp = target.get(p);
                        saveObject.forEach((val, key) => tmp.set(key, val));
                    } else if (typeof saveObject === "object") {
                        const tmp = target.get(p);
                        for(const field of Object.keys(saveObject)) {
                            tmp.set(field, saveObject[field]);
                        }
                    } else {
                        target.set(p, saveObject);
                    }
                } else {
                    target = target.get(p);
                }
            } else {
                if (i === path.length - 1) {
                    if (saveObject instanceof Map) {
                        target.set(p, saveObject);
                    } else if (typeof saveObject === "object") {
                        const tmp = new InnerRecord();
                        for (const field of Object.keys(saveObject)) {
                            tmp.set(field, saveObject[field]);
                        }
                        target.set(p, tmp);
                    } else {
                        target.set(p, saveObject);
                    }
                } else {
                    target.set(p, new InnerRecord());
                    target = target.get(p);
                }
            }
        }
    }

    private getLevelObject(level: DatabaseLevel): Map<Snowflake, InnerObject | object> {
        switch (level) {
            case DatabaseLevel.MESSAGE:
                return this.db.messages;
            case DatabaseLevel.USER:
                return this.db.users;
            case DatabaseLevel.CHANNEL:
                return this.db.channels;
            case DatabaseLevel.GUILD:
                return this.db.guilds;
        }
    }

}