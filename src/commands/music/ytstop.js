const commando = require("discord.js-commando");
const storage = require("../../services/storage");

module.exports = class YoutubeStopCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: "ytstop",
            group: "music",
            memberName: "ytstop",
            description: "Stop Youtube playback.",
            examples: [
                "ytstop"
            ],
            guildOnly: true
        });
    }

    run(msg) {
        let dispatcher = storage.getFromGuildLevel(msg.guild, "music.dispatcher");

        if (dispatcher) {
            dispatcher.end();

            let broadcast = storage.getFromGuildLevel(msg.guild, "music.broadcast");
            let voiceChannel = storage.getFromGuildLevel(msg.guild, "music.voiceChannel");

            if (broadcast) {
                broadcast.end();
            }

            if (voiceChannel) {
                voiceChannel.leave();
            }

            msg.client.user.setPresence({
                game: {
                    name: ""
                }
            });
            
            storage.saveOnGuildLevel(msg.guild, "music", {
                currentMusic: "",
                broadcast: undefined,
                dispatcher: undefined,
                voiceChannel: undefined
            });

            return msg.channel.send("Stopped the music.");
        } else {
            return msg.reply("There is no music to stop!");
        }
    }
};