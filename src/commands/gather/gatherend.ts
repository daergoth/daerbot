import { TextChannel } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { GatherHelperService } from "../../services/gather";

module.exports = class GatherEndCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: "gatherend",
            group: "gather",
            memberName: "gatherend",
            description: "Stops the currently going gather event in this channel.",
            examples: ["gatherend"],
            guildOnly: true
        });
    }

    public run(message: CommandoMessage, args: any) {
        const service = GatherHelperService.getInstance();
        service.clearGathering(message.channel as TextChannel);
        return null;
    }
}
