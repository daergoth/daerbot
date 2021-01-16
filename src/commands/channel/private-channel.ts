import { Command, CommandoMessage } from "discord.js-commando";
import { ChannelService, ChannelType } from "../../services/channel";

module.exports = class PrivateChannelCommand extends Command {
    constructor(client) {
        super(client, {
            name: "pchannel",
            group: "channel",
            memberName: "pchannel",
            description: "A voice channel will be created for you visible by others and it will self-destruct once everyone leaves it.",
            examples: ["pchannel", "pchannel @someone1 @someone2"],
            args: [
                {
                    key: "invitee",
                    label: "invitee",
                    prompt: "Who would you like to invite?",
                    type: "user",
                    default: "",
                    infinite: true,
                    isEmpty: (val, msg, arg) => {
                        if(Array.isArray(val)) return val.length === 0;
                        return !val;
                    }
                }
            ]
        });
    }

    public run(message: CommandoMessage, args) {
        // Deleting the message first for maximum discretion.
        message.delete();

        const service = ChannelService.getInstance();
        service.createPersonalChannel(message.member, ChannelType.VOICE, true, true)
            .then(privateChannel => {
                let inveteeList = args.invitee;
                if (typeof inveteeList !== "string") {
                    // Invitees specified
                    inveteeList = inveteeList.filter(invitee => invitee.id !== message.author.id);
                    inveteeList.forEach(invitee => service.inviteToPrivateChannel(message.member, invitee, privateChannel));
                }
            });
        return undefined;
    }
}
