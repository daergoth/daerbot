const commando = require("discord.js-commando");
const channelService = require("../../services/channel");

module.exports = class PrivateChannelCommand extends commando.Command {
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

    run(msg, args) {
        // Deleting the message first for maximum discretion.
        msg.delete();

        channelService.createPersonalChannel(msg.member, "voice", true, true)
            .then(privateChannel => {
                let inveteeList = args["invitee"];
                if (typeof inveteeList !== "string") {
                    // Invitees specified
                    inveteeList = inveteeList.filter(invitee => invitee.id !== msg.author.id);
                    inveteeList.forEach(invitee => channelService.inviteToPrivateChannel(msg.member, invitee, privateChannel));
                }
            });
    }
};
