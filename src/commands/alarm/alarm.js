const commando = require("discord.js-commando");
const timerService = require("../../services/timer");
const notificationService = require("../../services/notification");

module.exports = class AlarmCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: "alarm",
            group: "alarm",
            memberName: "alarm",
            description: "Sets up an alarm for given time with given text.",
            examples: ["alarm 18:00 Alarm text!"],
            args: [
                {
                    key: "time",
                    label: "time",
                    prompt: "Time for alarm",
                    type: "string"
                },
                {
                    key: "message",
                    label: "message",
                    prompt: "Message for alarm",
                    type: "string",
                    default: "Alarm"
                }
            ]
        });
    }

    run(msg, args) {
        let millisUntilTime = timerService.getMillisUntilTime(args["time"]);

        timerService.executeAfterMillis(millisUntilTime, () => {
            notificationService.notifyTextChannel(msg.channel, 1, args["message"]);
        });

        msg.client.emit("info", `Alarm set for ${millisUntilTime} milliseconds with message: ${args["message"]}`);

    }
};