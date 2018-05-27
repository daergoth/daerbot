const commando = require("discord.js-commando");

module.exports = class PlayingCommand extends commando.Command {
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

    run(msg, args) {
        msg.client.user.setPresence({
            game: {
                name: args.playing
            }
        });
    }
};