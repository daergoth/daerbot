const commando = require("discord.js-commando");

const storage = require("../../services/storage");
const customGatherCommandStorage = require("../../custom-gather-config.json");

const GatherHelperService = require("../../services/gather");

module.exports = class CustomGatherStartCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: "custom-gather",
            group: "gather",
            memberName: "custom-gather",
            description: "Starts a game-specific gather event in this channel.",
            examples: ["csgo? Who wants to play with me?"].concat(
                Object.keys(customGatherCommandStorage.gather)
                    .map(key => {
                        return `${key}?`;
                    })
            ),
            guildOnly: true,
            aliases: Object.keys(customGatherCommandStorage.gather)
                .map(key => {
                    return `${key}?`;
                }),
            args: [
                {
                    key: "title",
                    label: "gather_title",
                    prompt: "What should be the title?",
                    type: "string",
                    default: ""
                }
            ]
        });

        let commandKeywords = Object.keys(customGatherCommandStorage.gather).concat(["custom-gather"]); 
        let regexpString = "(" + commandKeywords.join("|") + ")\\?";

        this.regexp = new RegExp(regexpString);
    }

    run(msg, args) {
        let keywords = this.regexp.exec(msg.cleanContent);

        if (keywords && keywords.length >= 2) {
            if (customGatherCommandStorage.gather[keywords[1]] != undefined) {
                if (storage.getFromChannelLevel(msg.channel, "gather.isGathering")) {
                    return GatherHelperService.sendGatherStatus(msg.channel);
                } else {
                    storage.saveOnChannelLevel(msg.channel, "gather", {
                        customGame: keywords[1]
                    });
    
                    return GatherHelperService.startGather(msg, args.title);
                }
            } 
        } else {
            return msg.reply("Try to use a game-specific command instead!");
        }
    }
};
