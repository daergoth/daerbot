import { Command, CommandoMessage } from "discord.js-commando";
import { ChannelService, ChannelType } from "../../services/channel";

module.exports = class PersonalChannelCommand extends Command {
    constructor(client) {
        super(client, {
            name: "channel",
            group: "channel",
            memberName: "channel",
            description: "A voice channel will be created for you visible by others and it will self-destruct once everyone leaves it.",
            examples: ["channel"]
        });
    }

    public run(message: CommandoMessage, args) {
        const service = ChannelService.getInstance();
        service.createPersonalChannel(message.member, ChannelType.VOICE, true, false);
        message.delete();
        return undefined;
    }
};