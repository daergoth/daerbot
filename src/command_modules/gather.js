const Discord = require("discord.js");
const util = require("../util");
const configuration = require("../configuration");
const ContentRegExpHandler = require("../content-regexp-handler.js");

const CSGO_ICON_URL = configuration.getConfig("gather.csgo.image",
    "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/730/d0595ff02f5c79fd19b06f4d6165c3fda2372820.jpg");
const LOL_ICON_URL = configuration.getConfig("gather.lol.image",
    "http://vignette1.wikia.nocookie.net/leagueoflegends/images/8/86/League_of_legends_logo_transparent.png");
const DEFAULT_CSGO_TITLE = configuration.getConfig("gather.csgo.title", "CS:GO Matchmaking?");
const DEFAULT_LOL_TITLE = configuration.getConfig("gather.lol.title", "LoL Ranked?");

var joinListener = function (storage, message) {
    let starterMessage = storage.getFromChannelLevel(message.channel, "gather.starterMessage");
    let playerList = storage.getFromChannelLevel(message.channel, "gather.playerList", true, []);
    let currentRichEmbed = storage.getFromChannelLevel(message.channel, "gather.currentRichEmbed");
    let gatherMessages = storage.getFromChannelLevel(message.channel, "gather.gatherMessages", true, []);

    if (starterMessage && message.channel === starterMessage.channel) {
        if (message.content === "+" && !playerList.includes(message.author)) {
            playerList.push(message.author);
    
            currentRichEmbed.addField("\u200B", playerList.length + " - " + message.author);
    
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
        let title = "";
        if (message.content.split(" ").length > 1) {
            title = message.content.split(" ")[1];
        } else {
            if (storage.getFromChannelLevel(message.channel, "gather.isCSGO")) {
                title = DEFAULT_CSGO_TITLE;
            } else if (storage.getFromChannelLevel(message.channel, "gather.isLoL")) {
                title = DEFAULT_LOL_TITLE;
            }
        }

        currentRichEmbed = new Discord.RichEmbed()
            .setAuthor(storage.getFromChannelLevel(message.channel, "gather.starterMessage.author.username"),
                storage.getFromChannelLevel(message.channel, "gather.starterMessage.author.avatarURL"))
            .setTitle(title)
            .setDescription("Type '+' to join this gathering!")
            .setColor([255, 0, 0]);

        if (storage.getFromChannelLevel(message.channel, "gather.isCSGO")) {
            currentRichEmbed.setThumbnail(CSGO_ICON_URL);
        } else if (storage.getFromChannelLevel(message.channel, "gather.isLoL")) {
            currentRichEmbed.setThumbnail(LOL_ICON_URL);
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
    message.channel.send(currentRichEmbed);
    storage.getFromChannelLevel(message.channel, "gather.gatherMessages")
        .forEach(gM => gM.edit(currentRichEmbed));

    storage.saveOnChannelLevel(message.channel, "gather", {
        starterMessage: undefined,
        currentRichEmbed: undefined,
        endTimeout: undefined,
        playerList: [],
        gatherMessages: [],
        isCSGO: false,
        isLoL: false,
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

        if (params.length >= 2) {
            doGather(message, storage);
        } else {
            if (storage.getFromChannelLevel(message.channel, "gather.isGathering")) {
                sendGatherStatus(message, storage);
            } else {
                message.channel.send("Invalid command! .gather Question?");
            }
        }
    }
};

Object.setPrototypeOf(GatherHandler, ContentRegExpHandler);

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

function registerHandlers(registerFunction) {
    const gatherEndHandler = Object.create(GatherEndHandler);
    gatherEndHandler.GatherEndHandler();

    const gatherHandler = Object.create(GatherHandler);
    gatherHandler.GatherHandler();

    const csgoHandler = Object.create(CsgoHandler);
    csgoHandler.CsgoHandler();

    const lolHandler = Object.create(LolHandler);
    lolHandler.LolHandler();

    registerFunction(gatherEndHandler);
    registerFunction(gatherHandler);
    registerFunction(csgoHandler);
    registerFunction(lolHandler);
}

module.exports = {
    registerHandlers
};
