import { Command, CommandoMessage } from "discord.js-commando";

module.exports = class PlayingCommand extends Command {
    constructor(client) {
        super(client, {
            name: "playing",
            group: "me",
            memberName: "playing",
            description: "Sets the bot's Playing text.",
            examples: ["playing CS:GO with the boys"],
            args: [
                {
                    key: "playing",
                    label: "playing_text",
                    prompt: "What should I play?",
                    type: "string",
                    default: ""
                }
            ]
        });
    }

    public run(message: CommandoMessage, args) {
        message.client.user.setActivity({
            name: args.playing
        });
        return undefined;
    }
};