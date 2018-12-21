const commando = require("discord.js-commando");
const channelService = require("../../services/channel");

module.exports = class InviteCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: "inv",
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

    run(msg, args) {
        // Deleting the message first for maximum discretion.
        msg.delete();

        let inviteeList = args["invitee"];
        inviteeList = inviteeList.filter(invitee => invitee.id !== msg.author.id);
        inviteeList.forEach(invitee => channelService.inviteToPrivateChannel(msg.member, invitee));
    }
};
