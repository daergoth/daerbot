const Discord = require("discord.js");
const util = require("../util");
const PrefixedContentRegExpHandler = require("../matchers/prefixed-content-regexp-handler");

const PlayingHandler = {
    PlayingHandler() {
        this.secure = true;

        this.PrefixedContentRegExpHandler(/playing/);
    },
    handle(message) {
        let params = util.sanatizeCommandInput(message.content.split(" "));

        if (params.length >= 2) {
            message.client.user.setPresence({
                game: {
                    name: params.slice(1).join(" ")
                }
            });
        } else {
            message.channel.send("I'm playing " + message.client.user.presence.game.name);
        }
    }
};

Object.setPrototypeOf(PlayingHandler, PrefixedContentRegExpHandler);

const SayHandler = {
    SayHandler() {
        this.PrefixedContentRegExpHandler(/say/);
    },
    handle(message) {
        let params = util.sanatizeCommandInput(message.content.split(" "));
        if (params.length >= 2) {
            message.channel.send(params.slice(1).join(" "));
            message.delete();
        }
    }
};

Object.setPrototypeOf(SayHandler, PrefixedContentRegExpHandler);

const HelpHandler = {
    HelpHandler() {
        this.canBeDM = true;

        this.PrefixedContentRegExpHandler(/help/);
    },
    handle(message) {
        message.author.createDM()
            .then(dm => {
                let embed = new Discord.RichEmbed()
                    .setTitle("Help")
                    .setDescription("To check what can DaerBot do, click this:\n[https://daergoth.github.io/daerbot/commands.html](https://daergoth.github.io/daerbot/commands.html)")
                    .setAuthor(message.client.user.username, message.client.user.avatarUrl);
                dm.send(embed);
            });
    }
};

Object.setPrototypeOf(HelpHandler, PrefixedContentRegExpHandler);

function registerHandlers(registerFunction) {
    const playingHandler = Object.create(PlayingHandler);
    playingHandler.PlayingHandler();

    const sayHandler = Object.create(SayHandler);
    sayHandler.SayHandler();

    const helpHandler = Object.create(HelpHandler);
    helpHandler.HelpHandler();

    registerFunction(playingHandler);
    registerFunction(sayHandler);
    registerFunction(helpHandler);
}

module.exports = {
    registerHandlers
};
