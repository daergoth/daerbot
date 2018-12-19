const commando = require("discord.js-commando");

module.exports = class SelfAlarmCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: "selfalarm",
            group: "alarm",
            memberName: "elfalarm",
            description: "",
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
