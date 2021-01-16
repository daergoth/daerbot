import { Command, CommandoMessage } from "discord.js-commando";


module.exports = class SayCommand extends Command {
    constructor(client) {
        super(client, {
            name: "say",
            group: "me",
            memberName: "say",
            description: "The bot repeats the given text.",
            examples: ["say You are the best!"],
            args: [
                {
                    key: "text",
                    label: "text",
                    prompt: "Give me something to say.",
                    type: "string"
                }
            ]
        });
    }

    public run(message: CommandoMessage, args) {
        return message.delete()
            .then(() => {
                return message.channel.send(args.text);
            });
    }
};