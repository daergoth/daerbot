const commando = require("discord.js-commando");
const storage = require("../../services/storage");

function logListener(oldMember, newMember) {
    let logStatus = storage.getFromGuildLevel(oldMember.guild, "log.status", true, false);

    if (logStatus) {
        let logChannelName = "log";

        let logChannel = oldMember.guild.channels.find(c => c.name === logChannelName);
        if (!logChannel) {
            oldMember.guild.createChannel(logChannelName, "text")
                .then(textChannel => {
                    oldMember.client.emit("info", `Created channel for logging: ${textChannel}`);
                    logChannel = textChannel;
                })
                .catch(error => oldMember.client.emit("error", "Error while creating log channel: " + error));
        }

        if (!oldMember.voiceChannel) {
            logChannel.send(`${oldMember.user.username} connected to ${newMember.voiceChannel}!`);
        } else if (!newMember.voiceChannel) {
            logChannel.send(`${oldMember.user.username} disconnected from ${oldMember.voiceChannel}!`);
        } else {
            if (oldMember.voiceChannel !== newMember.voiceChannel) {
                logChannel.send(`${oldMember.user.username} switched from ${oldMember.voiceChannel} to ${newMember.voiceChannel}`);
            }
        }
    }
}

module.exports = class LogCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: "log",
            group: "log",
            memberName: "log",
            description: "Sets the logging status for voice channel activity.",
            examples: [
                "log",
                "log on",
                "log off"
            ],
            args: [
                {
                    key: "status",
                    label: "status",
                    prompt: "Logging status: on/off.",
                    type: "string",
                    default: ""
                }
            ],
            guildOnly: true
        });
    }

    run(msg, args) {
        let logStatus = storage.getFromGuildLevel(msg.guild, "log.status", true, false);

        if (args.status.length === 0) {
            return msg.reply(`Currently logging is turned **${logStatus ? "ON" : "OFF"}**!`);
        } else {
            switch (args.status) {
            case "on":
                logStatus = true;
                break;
            case "off":
                logStatus = false;
                break;
            default:
                return msg.reply("Not a valid status, please use on/off!");
            }

            storage.saveOnGuildLevel(msg.guild, "log.status", logStatus);

            if (!msg.client.listeners("voiceStateUpdate").includes(logListener)) {
                msg.client.on("voiceStateUpdate", logListener);
            }

            return msg.reply(`Logging turned **${logStatus ? "ON" : "OFF"}**!`);
        }
    }
};