const ytdl = require("ytdl-core");
const util = require("../util");
const ContentRegExpHandler = require("../content-regexp-handler.js");

const YoutubePlayHandler = {
    YoutubePlayHandler() {
        this.secure = true;

        this.ContentRegExpHandler(/^\.ytplay/);
    },
    handle(message, storage) {
        let params = util.sanatizeCommandInput(message.content.split(" "));

        if (params.length >= 2) {
            let broadcast = storage.getFromGuildLevel(message.guild, "music.broadcast");
            if (broadcast) {
                broadcast.end();
            }

            if (!ytdl.validateLink(params[1])) {
                message.channel.send("Invalid YouTube link!");
                return;
            }

            let youtubeUrl = params[1];

            broadcast = message.client.createVoiceBroadcast();

            ytdl.getInfo(youtubeUrl.toString())
                .then(info => {
                    message.client.user.setPresence({
                        game: {
                            name: info.title
                        }
                    });

                    storage.saveOnGuildLevel(message.guild, "music", {
                        currentMusic: info.title
                    });
                })
                .then(function videoInfoReceived() {
                    message.guild.fetchMember(message)
                        .then(guildMember => {
                            let voiceChannel = guildMember.voiceChannel;

                            if (voiceChannel) {
                                voiceChannel.join()
                                    .then(connection => {
                                        const stream = ytdl(youtubeUrl.toString(), { filter: "audioonly" });
                                        broadcast.playStream(stream, { seek: 0, volume: 0.05 });
                                        let dispatcher = connection.playBroadcast(broadcast);

                                        storage.saveOnGuildLevel(message.guild, "music", {
                                            broadcast: broadcast,
                                            voiceChannel: voiceChannel,
                                            dispatcher: dispatcher
                                        });
                                    })
                                    .catch(console.error);
                            } else {
                                message.channel.send("You have to join a voice channel first!");
                            }
                        });
                });

        } else {
            message.channel.send("Give me a Youtube link!");
        }
    }
};

Object.setPrototypeOf(YoutubePlayHandler, ContentRegExpHandler);

const YoutubePauseHandler = {
    YoutubePauseHandler() {
        this.secure = true;

        this.ContentRegExpHandler(/^\.ytpause/);
    },
    handle(message, storage) {
        let dispatcher = storage.getFromGuildLevel(message.guild, "music.dispatcher");
        if (dispatcher) {
            dispatcher.pause();
            message.channel.send("Paused the music.");
            message.client.user.setPresence({
                game: {
                    name: ""
                }
            });
        } else {
            message.channel.send("There is no music to pause!");
        }
    }
};

Object.setPrototypeOf(YoutubePauseHandler, ContentRegExpHandler);

const YoutubeResumeHandler = {
    YoutubeResumeHandler() {
        this.secure = true;

        this.ContentRegExpHandler(/^\.ytresume/);
    },
    handle(message, storage) {
        let dispatcher = storage.getFromGuildLevel(message.guild, "music.dispatcher");
        if (dispatcher) {
            dispatcher.resume();
            message.channel.send("Resumed the music.");
            message.client.user.setPresence({
                game: {
                    name: storage.getFromGuildLevel(message.guild, "music.currentMusic")
                }
            });
        } else {
            message.channel.send("There is no music to resume!");
        }
    }
};

Object.setPrototypeOf(YoutubeResumeHandler, ContentRegExpHandler);

const YoutubeStopHandler = {
    YoutubeStopHandler() {
        this.secure = true;

        this.ContentRegExpHandler(/^\.ytstop/);
    },
    handle(message, storage) {
        let dispatcher = storage.getFromGuildLevel(message.guild, "music.dispatcher");

        if (dispatcher) {
            dispatcher.end();

            let broadcast = storage.getFromGuildLevel(message.guild, "music.broadcast");
            let voiceChannel = storage.getFromGuildLevel(message.guild, "music.voiceChannel");

            if (broadcast) {
                broadcast.end();
            }

            if (voiceChannel) {
                voiceChannel.leave();
            }

            message.channel.send("Stopped the music.");
            message.client.user.setPresence({
                game: {
                    name: ""
                }
            });

            storage.saveOnGuildLevel(message.guild, "music", {
                currentMusic: "",
                broadcast: undefined,
                dispatcher: undefined,
                voiceChannel: undefined
            });
        } else {
            message.channel.send("There is no music to stop!");
        }
    }
};

Object.setPrototypeOf(YoutubeStopHandler, ContentRegExpHandler);

const VolumeHandler = {
    VolumeHandler() {
        this.secure = true;

        this.ContentRegExpHandler(/^\.volume/);
    },
    handle(message, storage) {
        let params = util.sanatizeCommandInput(message.content.split(" "));

        if (params.length >= 2) {
            if (/^[\d]+$/.test(params[1])) {
                var volumePercent = parseInt(params[1]);
                if (volumePercent > 0 && volumePercent <= 100) {
                    let broadcast = storage.getFromGuildLevel(message.guild, "music.broadcast");

                    if (broadcast) {
                        broadcast.setVolume(volumePercent / 100);

                        storage.saveOnGuildLevel(message.guild, "music", {
                            broadcast: broadcast
                        });
                    }
                }
            } else {
                message.channel.send("The volume should be between 0 and 100 percent!");
            }
        } else {
            message.channel.send("Missing volume percentage!");
        }
    }
};

Object.setPrototypeOf(VolumeHandler, ContentRegExpHandler);

function registerHandlers(registerFunction) {
    const youtubePlayHandler = Object.create(YoutubePlayHandler);
    youtubePlayHandler.YoutubePlayHandler();

    const youtubePauseHandler = Object.create(YoutubePauseHandler);
    youtubePauseHandler.YoutubePauseHandler();

    const youtubeResumeHandler = Object.create(YoutubeResumeHandler);
    youtubeResumeHandler.YoutubeResumeHandler();

    const youtubeStopHandler = Object.create(YoutubeStopHandler);
    youtubeStopHandler.YoutubeStopHandler();

    const volumeHandler = Object.create(VolumeHandler);
    volumeHandler.VolumeHandler();

    registerFunction(youtubePlayHandler);
    registerFunction(youtubePauseHandler);
    registerFunction(youtubeResumeHandler);
    registerFunction(youtubeStopHandler);
    registerFunction(volumeHandler);
}

module.exports = {
    registerHandlers
};
