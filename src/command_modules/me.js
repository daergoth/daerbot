var Discord = require("discord.js");
var fs = require("fs");
var router = require("../commandRouter");

var _commands = [
    {
        command: "playing",
        secure: true,
        callback: function (message, client) {
            let params = message.content.split(" ");

            if (params.length < 2) {
                message.channel.send("I'm playing " + client.user.presence.game.name);
            } else {
                client.user.setPresence({
                    game: {
                        name: params.slice(1).join(" ")
                    }
                });
            }
        }
    },
    {
        command: "say",
        callback: function (message) {
            let params = message.content.split(" ");
            if (params.length > 1) {
                message.channel.send(params.slice(1).join(" "));
                message.delete();
            }
        }
    },
    {
        command: "help",
        callback: function (message, client) {
            message.author.createDM()
                .then(dm => {
                    let embed = new Discord.RichEmbed()
                        .setTitle("Help")
                        .setDescription(fs.readFileSync("./README.md"))
                        .setAuthor("DaerBot", client.user.avatarUrl);
                    dm.send(embed);
                });
        }
    }
];

module.exports = router.getRoutingFunction(_commands);