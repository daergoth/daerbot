const commando = require("discord.js-commando");

const PollHelperService = require("../../service/poll");

module.exports = class PollEndCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: "pollend",
            group: "poll",
            memberName: "pollend",
            description: "Stops the current poll in this channel.",
            examples: ["pollend"],
            guildOnly: true
        });
    }

    run(msg) {
        if (PollHelperService.isRunningPoll(msg.channel)) {
            return PollHelperService.clearPoll(msg.channel);
        } else {
            return msg.reply("There is no poll to end!");
        }
    }
};