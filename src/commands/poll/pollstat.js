const commando = require("discord.js-commando");

const PollHelperService = require("../../service/poll");

module.exports = class PollStatCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: "pollstat",
            group: "poll",
            memberName: "pollstat",
            description: "Shows the current poll standing in this channel.",
            examples: ["pollstat"],
            guildOnly: true
        });
    }

    run(msg) {
        let embed = PollHelperService.generatePollEmbed(msg.channel);

        if (embed) {
            return msg.channel.send(embed);
        } else {
            return msg.reply("There is no active poll right now!");
        }
    }
};