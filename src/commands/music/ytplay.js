const commando = require("discord.js-commando");
const ytdl = require("ytdl-core");
const storage = require("../../services/storage");

module.exports = class PokeCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: "ytplay",
            group: "music",
            memberName: "ytplay",
            description: "Start Youtube playback..",
            examples: [
                "ytplay https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            ],
            args: [
                {
                    key: "youtubeUrl",
                    label: "youtubeUrl",
                    prompt: "Give me a Youtube URL to play.",
                    type: "string"
                },
            ],
            guildOnly: true,
            ownerOnly: true
        });
    }

    run(msg, args) {
       
        let broadcast = storage.getFromGuildLevel(msg.guild, "music.broadcast");
        if (broadcast) {
            broadcast.end();
        }

        if (!ytdl.validateURL(args.youtubeUrl)) {
            return msg.reply("Invalid YouTube link!");
        }

        broadcast = msg.client.createVoiceBroadcast();

        ytdl.getInfo(args.youtubeUrl)
            .then(info => {
                msg.client.user.setPresence({
                    game: {
                        name: info.title
                    }
                });

                storage.saveOnGuildLevel(msg.guild, "music", {
                    currentMusic: info.title
                });
            })
            .then(function videoInfoReceived() {
                msg.guild.fetchMember(msg.author)
                    .then(guildMember => {
                        let voiceChannel = guildMember.voiceChannel;

                        if (voiceChannel) {
                            voiceChannel.join()
                                .then(connection => {
                                    const stream = ytdl(args.youtubeUrl, { filter: "audioonly" });
                                    broadcast.playStream(stream, { seek: 0, volume: 0.05 });
                                    let dispatcher = connection.playBroadcast(broadcast);

                                    storage.saveOnGuildLevel(msg.guild, "music", {
                                        broadcast: broadcast,
                                        voiceChannel: voiceChannel,
                                        dispatcher: dispatcher
                                    });
                                })
                                .catch(error => msg.client.emit("error", `Error during YT music play channel join: ${error}`));
                        } else {
                            return msg.reply("You have to join a voice channel first!");
                        }
                    });
            });
    }
};