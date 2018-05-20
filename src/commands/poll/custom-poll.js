const commando = require("discord.js-commando");

const storage = require("../../services/storage");

const PollHelperService = require("../../services/poll");

module.exports = class PollCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: "custom-poll",
            group: "poll",
            aliases: [
                "csgomap?"
            ],
            memberName: "custom-poll",
            description: "Starts a game-specific poll in this channel.",
            examples: ["csgomap?"],
            guildOnly: true
        });
    }

    run(msg) {
        storage.saveOnChannelLevel(msg.channel, "poll", {
            isCSGO: true
        });

        return PollHelperService.startPoll(msg, "Which map?;Dust 2;Inferno;Mirage;Cache;Cobblestone;Overpass;Train;Nuke");
    }
};