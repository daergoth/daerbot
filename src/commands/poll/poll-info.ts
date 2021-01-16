import { Command, CommandoMessage } from "discord.js-commando";
import { PollHelperService } from "../../services/poll";

module.exports = class PollStatCommand extends Command {
    constructor(client) {
        super(client, {
            name: "pollinfo",
            group: "poll",
            memberName: "pollinfo",
            description: "Shows the current poll standing in this channel.",
            examples: ["pollinfo"],
            guildOnly: true
        });
    }

    public run(message: CommandoMessage, args) {
        const service = PollHelperService.getInstance();
        const embed = service.generatePollEmbed(message);

        if (embed) {
            return message.channel.send(embed);
        } else {
            return message.reply("There is no active poll right now!");
        }
    }
};