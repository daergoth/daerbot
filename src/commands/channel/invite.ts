import { Command, CommandoMessage } from "discord.js-commando";
import { ChannelService } from "../../services/channel";

module.exports = class InviteCommand extends Command {
    constructor(client) {
        super(client, {
            name: "inv",
            aliases: ["invite"],
            group: "channel",
            memberName: "inv",
            description: "Invite another person to your private channel.",
            examples: ["inv @someone1", "inv @someone1 @someone2"],
            args: [
                {
                    key: "invitee",
                    label: "invitee",
                    prompt: "Who would you like to invite?",
                    type: "user",
                    infinite: true
                }
            ]
        });
    }

    public run(message: CommandoMessage, args) {
        // Deleting the message first for maximum discretion.
        message.delete();

        const service = ChannelService.getInstance();
        let inviteeList = args.invitee;
        inviteeList = inviteeList.filter(invitee => invitee.id !== message.author.id);
        inviteeList.forEach(invitee => service.inviteToPrivateChannel(message.member, invitee));

        return undefined;
    }
}