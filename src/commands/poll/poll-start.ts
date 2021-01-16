import { Command, CommandoMessage } from "discord.js-commando";
import { PollHelperService } from "../../services/poll";

module.exports = class PollCommand extends Command {
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

    public run(message: CommandoMessage, args) {
        const service = PollHelperService.getInstance();
        return service.startPoll(message, args.text);
    }
};
