import { Message, TextChannel } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { GatherHelperService } from "../../services/gather";
import { DiscordBasedStorage } from "../../services/storage";

module.exports = class GatherStartCommand extends Command {

    constructor(client: CommandoClient) {
        super(client, {
            name: "gather",
            group: "gather",
            memberName: "gather",
            description: "Starts a gather event in this channel.",
            examples: ["gather Who wants to play with me?"],
            guildOnly: true,
            args: [
                {
                    key: "title",
                    label: "gather_title",
                    prompt: "What should be the title?",
                    type: "string"
                }
            ]
        });
    }

    public run(message: CommandoMessage, args) {
        const storage = DiscordBasedStorage.getInstance();
        const service = GatherHelperService.getInstance();
        const channel = message.channel as TextChannel;

        if (storage.getFromChannelLevel(channel as TextChannel, "gather.isGathering", false, false)) {
            return service.sendGatherStatus(channel);
        } else {
            return service.startGather(message as Message, args.title);
        }

    }

}
