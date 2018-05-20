const commando = require("discord.js-commando");

const storage = require("../../service/storage");

const GatherHelperService = require("../../service/gather");

module.exports = class GatherStartCommand extends commando.Command {
    constructor(client) {
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

    run(msg, args) {
        if (storage.getFromChannelLevel(msg.channel, "gather.isGathering")) {
            return GatherHelperService.sendGatherStatus(msg.channel);
        } else {
            return GatherHelperService.startGather(msg, args.title);
        }
    }
};
