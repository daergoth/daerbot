const fs = require("fs");
const Discord = require("discord.js");
const ContentRegExpHandler = require("../content-regexp-handler.js");

const PlayingHandler = {
    PlayingHandler() {
        this.secure = true;

        this.ContentRegExpHandler(/^.playing/);
    },
    handle(message, client) {
        let params = message.content.split(" ");

        if (params.length >= 2) {
            client.user.setPresence({
                game: {
                    name: params.slice(1).join(" ")
                }
            });
        } else {
            message.channel.send("I'm playing " + client.user.presence.game.name);
        }
    }
};

Object.setPrototypeOf(PlayingHandler, ContentRegExpHandler);

const SayHandler = {
    SayHandler() {
        this.ContentRegExpHandler(/^.say/);
    },
    handle(message) {
        let params = message.content.split(" ");
        if (params.length >= 2) {
            message.channel.send(params.slice(1).join(" "));
            message.delete();
        }
    }
};

Object.setPrototypeOf(SayHandler, ContentRegExpHandler);

const HelpHandler = {
    HelpHandler() {
        this.ContentRegExpHandler(/^.help/);
    },
    handle(message, client) {
        message.author.createDM()
            .then(dm => {
                let embed = new Discord.RichEmbed()
                    .setTitle("Help")
                    .setDescription(fs.readFileSync("./COMMANDS.md"))
                    .setAuthor("DaerBot", client.user.avatarUrl);
                dm.send(embed);
            });
    }
};

Object.setPrototypeOf(HelpHandler, ContentRegExpHandler);

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
