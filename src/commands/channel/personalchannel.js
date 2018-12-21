const commando = require("discord.js-commando");
const channelService = require("../../services/channel");

module.exports = class PersonalChannelCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: "channel",
            group: "channel",
            memberName: "channel",
            description: "A voice channel will be created for you visible by others and it will self-destruct once everyone leaves it.",
            examples: ["channel"]
        });
    }

    run(msg, args) {
        channelService.createPersonalChannel(msg.member, "voice", true, false);
        msg.delete();
    }
};
