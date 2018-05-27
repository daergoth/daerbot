const commando = require("discord.js-commando");
const storage = require("../../services/storage");

module.exports = class YoutubeResumeCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: "ytresume",
            group: "music",
            memberName: "ytresume",
            description: "Resume Youtube playback.",
            examples: [
                "ytresume"
            ],
            guildOnly: true
        });
    }

    run(msg) {
        let dispatcher = storage.getFromGuildLevel(msg.guild, "music.dispatcher");
        if (dispatcher) {
            dispatcher.resume();
            msg.client.user.setPresence({
                game: {
                    name: storage.getFromGuildLevel(msg.guild, "music.currentMusic")
                }
            });

            return msg.channel.send("Resumed the music.");
        } else {
            return msg.reply("There is no music to resume!");
        }
    }
};