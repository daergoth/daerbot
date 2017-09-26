const Discord = require("discord.js");
const ContentRegExpHandler = require("../content-regexp-handler.js");
const configuration = require("../configuration");

var CSGO_ICON_URL = configuration.getConfig("gather.csgo.image", 
    "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/730/d0595ff02f5c79fd19b06f4d6165c3fda2372820.jpg");
var LOL_ICON_URL = configuration.getConfig("gather.lol.image", 
    "http://vignette1.wikia.nocookie.net/leagueoflegends/images/8/86/League_of_legends_logo_transparent.png");
var DEFAULT_CSGO_TITLE = configuration.getConfig("gather.csgo.title", "CS:GO Matchmaking?");
var DEFAULT_LOL_TITLE = configuration.getConfig("gather.lol.title", "LoL Ranked?");

var isCSGO = false;
var isLoL = false;

var isGathering = false;
var starterMessage;

var gatherMessages = [];
var currentRichEmbed;

var playerList = [];

var endTimeout;

var joinListener = function (message) {
    if (message.content === "+" && !playerList.includes(message.author)) {
        playerList.push(message.author);

        currentRichEmbed.addField("\u200B", playerList.length + " - " + message.author);

        gatherMessages.forEach(gM => gM.edit(currentRichEmbed));

        message.delete(2000);
    }
};

function sendGatherStatus(message) {
    if (currentRichEmbed === undefined) {
        let title = "";
        if (message.content.split(" ").length > 1) {
            title = message.content.split(" ")[1];
        } else {
            if (isCSGO) {
                title = DEFAULT_CSGO_TITLE;
            } else if (isLoL) {
                title = DEFAULT_LOL_TITLE;
            }
        }

        currentRichEmbed = new Discord.RichEmbed()
            .setAuthor(starterMessage.author.username, starterMessage.author.avatarURL)
            .setTitle(title)
            .setDescription("Type '+' to join this gathering!")
            .setColor([255, 0, 0]);

        for (let i = 0; i < playerList.length; ++i) {
            currentRichEmbed.addField("\u200B", i + 1 + " - " + playerList[i]);
        }

        if (isCSGO) {
            currentRichEmbed.setThumbnail(CSGO_ICON_URL);
        } else if (isLoL) {
            currentRichEmbed.setThumbnail(LOL_ICON_URL);
        }
    }

    message.channel.send(currentRichEmbed)
        .then(m => gatherMessages.push(m));
}


function clearGathering(message, client) {
    if (!isGathering) {
        return;
    }

    client.removeListener("message", joinListener);
    clearTimeout(endTimeout);

    currentRichEmbed.setFooter("ENDED!");
    message.channel.send(currentRichEmbed);
    gatherMessages.forEach(gM => gM.edit(currentRichEmbed));

    starterMessage = undefined;
    isGathering = false;
    currentRichEmbed = undefined;
    playerList = [];
    gatherMessages = [];
    isCSGO = false;
    isLoL = false;
}

function doGather(message, client) {
    starterMessage = message;

    sendGatherStatus(message);

    client.on("message", joinListener);

    isGathering = true;

    // 5 min timeout to auto-stop gathering
    endTimeout = setTimeout(clearGathering, 300000, message, client);
}

const GatherEndHandler = {
    GatherEndHandler() {
        this.ContentRegExpHandler(/^.gatherend/);
    },
    handle(message, client) {
        clearGathering(message, client);
    }
};

Object.setPrototypeOf(GatherEndHandler, ContentRegExpHandler);

const GatherHandler = {
    GatherHandler() {
        this.ContentRegExpHandler(/^.gather/);
    },
    handle(message, client) {
        let params = message.content.split(" ");

        if (params.length >= 2) {
            doGather(message, client);
        } else {
            if (isGathering) {
                sendGatherStatus(message);
            } else {
                message.channel.send("Invalid command! .gather Question?");
            }
        }
    }
};

Object.setPrototypeOf(GatherHandler, ContentRegExpHandler);

const CsgoHandler = {
    CsgoHandler() {
        this.ContentRegExpHandler(/^.csgo?/);
    },
    handle(message, client) {
        if (isGathering) {
            sendGatherStatus(message);
        } else {
            isCSGO = true;

            doGather(message, client);
        }
    }
};

Object.setPrototypeOf(CsgoHandler, ContentRegExpHandler);

const LolHandler = {
    LolHandler() {
        this.ContentRegExpHandler(/^.lol?/);
    },
    handle(message, client) {
        if (isGathering) {
            sendGatherStatus(message);
        } else {
            isLoL = true;

            doGather(message, client);
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
