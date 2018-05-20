const commando = require("discord.js-commando");

const PollHelperService = require("../../service/poll");

module.exports = class PollCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: "poll",
            group: "poll",
            memberName: "poll",
            description: "Starts a poll in this channel.",
            examples: ["poll Question?;Option 1;Option 2"],
            args: [
                {
                    key: "text",
                    label: "poll_text",
                    prompt: "Please specify the poll.",
                    type: "string"
                }
            ],
            guildOnly: true
        });
    }

    run(msg, args) {
        return PollHelperService.startPoll(msg, args.text);
    }
};
