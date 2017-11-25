const Discord = require("discord.js");
const util = require("../util");
const configuration = require("../configuration");
const ContentRegExpHandler = require("../content-regexp-handler.js");

var joinListener = function (storage, message) {
    let starterMessage = storage.getFromChannelLevel(message.channel, "gather.starterMessage");
    let playerList = storage.getFromChannelLevel(message.channel, "gather.playerList", true, []);
    let currentRichEmbed = storage.getFromChannelLevel(message.channel, "gather.currentRichEmbed");
    let gatherMessages = storage.getFromChannelLevel(message.channel, "gather.gatherMessages", true, []);

    if (starterMessage && message.channel === starterMessage.channel) {
        if (message.content.startsWith("+") && !playerList.includes(message.author)) {
            playerList.push(message.author);

            let note = util.sanatizeCommandInput(message.content.split(" ").slice(1)).join(" ");

            let m = `${playerList.length} - ${message.author}`;
            if (note) {
                m += `: ${note}`;
            }

            currentRichEmbed.addField("\u200B", m);

            gatherMessages.forEach(gM => gM.edit(currentRichEmbed));

            message.delete(2000);

            storage.saveOnChannelLevel(message.channel, "gather", {
                playerList: playerList,
                currentRichEmbed: currentRichEmbed
            });
        }
    }
};

function sendGatherStatus(message, storage) {
    let currentRichEmbed = storage.getFromChannelLevel(message.channel, "gather.currentRichEmbed");
    if (!currentRichEmbed) {
        currentRichEmbed = new Discord.RichEmbed()
            .setAuthor(storage.getFromChannelLevel(message.channel, "gather.starterMessage.author.username"),
                storage.getFromChannelLevel(message.channel, "gather.starterMessage.author.avatarURL"))
            .setDescription("Type '+' to join this gathering!")
            .setColor([255, 0, 0]);

        let customGameKeyword = storage.getFromChannelLevel(message.channel, "gather.customGame");
        let customGameObject = configuration.getConfig("gather." + customGameKeyword, undefined);
        if (customGameObject != undefined) {
            currentRichEmbed.setTitle(customGameObject.title);
            currentRichEmbed.setThumbnail(customGameObject.thumbnail);
        }

        if (message.content.split(" ").length > 1) {
            currentRichEmbed.setTitle(message.content.split(" ").slice(1).join(" "));
        }

        storage.saveOnChannelLevel(message.channel, "gather", {
            currentRichEmbed: currentRichEmbed
        });
    }

    message.channel.send(currentRichEmbed)
        .then(m => {
            let gatherMessages = storage.getFromChannelLevel(message.channel, "gather.gatherMessages", true, []);
            gatherMessages.push(m);
            storage.saveOnChannelLevel(message.channel, "gather", {
                gatherMessages: gatherMessages
            });
        });
}


function clearGathering(message, storage) {
    if (!storage.getFromChannelLevel(message.channel, "gather.isGathering")) {
        return;
    }

    message.client.removeListener("message", storage.getFromChannelLevel(message.channel, "gather.joinListener"));

    if (storage.getFromChannelLevel(message.channel, "gather.endTimeout")) {
        clearTimeout(storage.getFromChannelLevel(message.channel, "gather.endTimeout"));
    }

    let currentRichEmbed = storage.getFromChannelLevel(message.channel, "gather.currentRichEmbed");

    currentRichEmbed.setFooter("ENDED!");
    currentRichEmbed.setDescription("");
    message.channel.send(currentRichEmbed);
    storage.getFromChannelLevel(message.channel, "gather.gatherMessages")
        .forEach(gM => gM.edit(currentRichEmbed));

    storage.saveOnChannelLevel(message.channel, "gather", {
        starterMessage: undefined,
        currentRichEmbed: undefined,
        endTimeout: undefined,
        playerList: [],
        gatherMessages: [],
        customGame: "",
        isGathering: false
    });
}

function doGather(message, storage) {
    let listener = joinListener.bind(this, storage);

    storage.saveOnChannelLevel(message.channel, "gather", {
        starterMessage: message,
        isGathering: true,
        // 15 min timeout to auto-stop gathering
        endTimeout: setTimeout(clearGathering, 1000 * 60 * 15, message, storage),
        joinListener: listener
    });

    sendGatherStatus(message, storage);

    message.client.on("message", listener);
}

const GatherEndHandler = {
    GatherEndHandler() {
        this.ContentRegExpHandler(/^\.gatherend/);
    },
    handle(message, storage) {
        clearGathering(message, storage);
    }
};

Object.setPrototypeOf(GatherEndHandler, ContentRegExpHandler);

const GatherHandler = {
    GatherHandler() {
        this.ContentRegExpHandler(/^\.gather/);
    },
    handle(message, storage) {
        let params = util.sanatizeCommandInput(message.content.split(" "));

        if (storage.getFromChannelLevel(message.channel, "gather.isGathering")) {
            sendGatherStatus(message, storage);
        } else {
            if (params.length >= 2) {
                doGather(message, storage);
            } else {
                message.channel.send("Invalid command! .gather Question?");
            }
        }
    }
};

Object.setPrototypeOf(GatherHandler, ContentRegExpHandler);

/*
const CsgoHandler = {
    CsgoHandler() {
        this.ContentRegExpHandler(/^\.csgo\?/);
    },
    handle(message, storage) {
        if (storage.getFromChannelLevel(message.channel, "gather.isGathering")) {
            sendGatherStatus(message, storage);
        } else {
            storage.saveOnChannelLevel(message.channel, "gather", {
                isCSGO: true
            });

            doGather(message, storage);
        }
    }
};

Object.setPrototypeOf(CsgoHandler, ContentRegExpHandler);

const LolHandler = {
    LolHandler() {
        this.ContentRegExpHandler(/^\.lol\?/);
    },
    handle(message, storage) {
        if (storage.getFromChannelLevel(message.channel, "gather.isGathering")) {
            sendGatherStatus(message, storage);
        } else {
            storage.saveOnChannelLevel(message.channel, "gather", {
                isLoL: true
            });

            doGather(message, storage);
        }
    }
};

Object.setPrototypeOf(LolHandler, ContentRegExpHandler);
*/

const CustomGameGatherHandler = {
    CustomGameGatherHandler() {
        let commandKeywords = Object.keys(configuration.getConfig("gather", Object.create(null))); 
        let regexpString = "^\\.(" + commandKeywords.join("|") + ")\\?";

        this.regexp = new RegExp(regexpString);

        this.ContentRegExpHandler(this.regexp);
    },
    handle(message, storage) {
        let keyword = this.regexp.exec(message)[1];
        if (configuration.getConfig("gather." + keyword, undefined) != undefined) {
            if (storage.getFromChannelLevel(message.channel, "gather.isGathering")) {
                sendGatherStatus(message, storage);
            } else {
                storage.saveOnChannelLevel(message.channel, "gather", {
                    customGame: keyword
                });

                doGather(message, storage);
            }
        }
    }
};

Object.setPrototypeOf(CustomGameGatherHandler, ContentRegExpHandler);

function registerHandlers(registerFunction) {
    const gatherEndHandler = Object.create(GatherEndHandler);
    gatherEndHandler.GatherEndHandler();

    const gatherHandler = Object.create(GatherHandler);
    gatherHandler.GatherHandler();

    const customGameGatherHandler = Object.create(CustomGameGatherHandler);
    customGameGatherHandler.CustomGameGatherHandler();

    /*
    const csgoHandler = Object.create(CsgoHandler);
    csgoHandler.CsgoHandler();

    const lolHandler = Object.create(LolHandler);
    lolHandler.LolHandler();
    */

    registerFunction(gatherEndHandler);
    registerFunction(gatherHandler);
    registerFunction(customGameGatherHandler);

    /*
    registerFunction(csgoHandler);
    registerFunction(lolHandler);
    */
}

module.exports = {
    registerHandlers
};
