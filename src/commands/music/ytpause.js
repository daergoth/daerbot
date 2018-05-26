const commando = require("discord.js-commando");
const storage = require("../../services/storage");

module.exports = class YoutubePauseCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: "ytpause",
            group: "music",
            memberName: "ytpause",
            description: "Pause Youtube playback.",
            examples: [
                "ytpause"
            ],
            guildOnly: true
        });
    }

    run(msg) {
        let dispatcher = storage.getFromGuildLevel(msg.guild, "music.dispatcher");
        if (dispatcher) {
            dispatcher.pause();
            msg.client.user.setPresence({
                game: {
                    name: ""
                }
            });

            return msg.channel.send("Paused the music.");
        } else {
            return msg.reply("There is no music to pause!");
        }
    }
};