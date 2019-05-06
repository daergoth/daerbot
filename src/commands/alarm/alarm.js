const commando = require("discord.js-commando");
const moment = require("moment");
const alarmService = require("../../services/alarm");

module.exports = class AlarmCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: "alarm",
            group: "alarm",
            memberName: "alarm",
            description: "Sets up an alarm for given time with given text.",
            examples: ["alarm 18:00 Alarm text!"],
            aliases: ["textalarm"],
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
        let millisUntilTime = alarmService.createTextAlarm(msg.author, msg.channel, args["time"], args["message"]);
        let humanizedMillis = moment.duration(millisUntilTime, "milliseconds").humanize();

        msg.delete()
            .catch(error => msg.client.emit("error", `Alarm set message delete error: ${error}`));

        msg.reply(`Alarm set for ${args["time"]} (${humanizedMillis} left) with message: ${args["message"]}`)
            .then(msg => msg.client.emit("info", `Alarm set for ${args["time"]} (${humanizedMillis} left, ${millisUntilTime}ms) with message: ${args["message"]}`))
            .catch(error => msg.client.emit("error", `Alarm set message reply error: ${error}`));
    }
};