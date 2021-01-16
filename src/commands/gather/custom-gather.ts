import { Command, CommandoMessage } from "discord.js-commando";
import { GatherHelperService } from "../../services/gather";
import { DiscordBasedStorage } from "../../services/storage";
import { gather } from "../../custom-gather-config.json";
import { TextChannel } from "discord.js";

module.exports = class CustomGatherStartCommand extends Command {
    private regexp: RegExp;

    constructor(client) {
        super(client, {
            name: "custom-gather",
            group: "gather",
            memberName: "custom-gather",
            description: "Starts a game-specific gather event in this channel.",
            examples: ["csgo? Who wants to play with me?"].concat(
                Object.keys(gather)
                    .map(key => {
                        return `${key}?`;
                    })
            ),
            guildOnly: true,
            aliases: Object.keys(gather)
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

        const commandKeywords = Object.keys(gather).concat(["custom-gather"]);
        const regexpString = "(" + commandKeywords.join("|") + ")\\?";

        this.regexp = new RegExp(regexpString);
    }

    public run(message: CommandoMessage, args) {
        const storage = DiscordBasedStorage.getInstance();
        const service = GatherHelperService.getInstance();
        const channel = message.channel as TextChannel;
        
        const keywords = this.regexp.exec(message.cleanContent);

        if (keywords && keywords.length >= 2) {
            if (gather[keywords[1]] !== undefined) {
                if (storage.getFromChannelLevel(channel, "gather.isGathering")) {
                    return service.sendGatherStatus(channel);
                } else {
                    storage.saveOnChannelLevel(channel, "gather", {
                        customGame: keywords[1]
                    });

                    return service.startGather(message, args.title);
                }
            }
        } else {
            return message.reply("Try to use a game-specific command instead!");
        }
    }
};