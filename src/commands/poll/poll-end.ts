import { Command, CommandoMessage } from "discord.js-commando";
import { PollHelperService } from "../../services/poll";

module.exports = class PollEndCommand extends Command {
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

    public run(message: CommandoMessage, args) {
        const service = PollHelperService.getInstance();
        if (service.isRunningPoll(message)) {
            return service.clearPoll(message);
        } else {
            return message.reply("There is no poll to end!");
        }
    }
};