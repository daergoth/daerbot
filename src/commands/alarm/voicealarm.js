const commando = require("discord.js-commando");
const moment = require("moment");
const alarmService = require("../../services/alarm");

module.exports = class VoiceAlarmCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: "voicealarm",
            group: "alarm",
            memberName: "voicealarm",
            description: "Sets up a voice alarm in the users current voice channel for the given time.",
            examples: ["voicealarm 18:00 #voicechannel"],
            guildOnly: true,
            args: [
                {
                    key: "time",
                    label: "time",
                    prompt: "Time for alarm",
                    type: "string"
                }
            ]
        });
    }

    run(msg, args) {
        let channel = msg.member.voiceChannel;

        if (channel === undefined) {
            msg.channel.send("Setting alarm failed! User is not in any voice channel.");
        } else {
            if (channel.type === "voice") {
                let millisUntilTime = alarmService.createVoiceAlarm(msg.author, channel, args["time"]);
                let humanizedMillis = moment.duration(millisUntilTime, "milliseconds").humanize();

                msg.reply(`Alarm set for ${args["time"]} (${humanizedMillis} left)`)
                    .then(msg => msg.client.emit("info", `Alarm set for ${args["time"]} (${humanizedMillis} left, ${millisUntilTime}ms)`))
                    .catch(error => msg.client.emit("error", `Alarm set message reply error: ${error}`));
            } else {
                msg.channel.send("Setting alarm failed! Given channel is not a voice channel!");
            }
        }

        msg.delete()
            .catch(error => msg.client.emit("error", `Alarm set message delete error: ${error}`));
    }
};