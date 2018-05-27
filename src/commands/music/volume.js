const commando = require("discord.js-commando");
const storage = require("../../services/storage");

module.exports = class VolumeCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: "volume",
            group: "music",
            memberName: "volume",
            description: "Set the volume of Youtube music play.",
            examples: [
                "volume 0",
                "volume 10"
            ],
            args: [
                {
                    key: "volumePercent",
                    label: "volume",
                    prompt: "Set the playback volume.",
                    type: "integer"
                }
            ],
            guildOnly: true
        });
    }

    run(msg, args) {
        if (args.volumePercent > 0 && args.volumePercent <= 100) {
            let broadcast = storage.getFromGuildLevel(msg.guild, "music.broadcast");

            if (broadcast) {
                broadcast.setVolume(args.volumePercent / 100);

                return msg.channel.send("Set the volume to " + args.volumePercent + "%!");
            }
        }
    }
};