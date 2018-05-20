const commando = require("discord.js-commando");
const GatherHelperService = require("../../service/gather");

module.exports = class GatherEndCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: "gatherend",
            group: "gather",
            memberName: "gatherend",
            description: "Stops the currently going gather event in this channel.",
            examples: ["gatherend"],
            guildOnly: true
        });
    }

    run(msg) {
        GatherHelperService.clearGathering(msg.channel, msg.client);
    }
};