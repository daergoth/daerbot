const commando = require("discord.js-commando");
const moment = require("moment");

module.exports = class AlarmCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: "alarm",
            group: "alarm",
            memberName: "alarm",
            description: "An alarm will be set for the given time in this text channel.",
            examples: ["alarm 12:00", "alarm"],
            args: [
                {
                    key: "time",
                    label: "time",
                    prompt: "When should the alarm go off?",
                    type: "string"
                }
            ]
        });
    }

    run(msg, args) {
        
    }
};
