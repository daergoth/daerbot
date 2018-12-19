const commando = require("discord.js-commando");

module.exports = class SayCommand extends commando.Command {
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

    run(msg, args) {
        return msg.delete()
            .then(() => {
                msg.channel.send(args.text);
            });
    }
};
