const ytdl = require("ytdl-core");
const ContentRegExpHandler = require("../content-regexp-handler.js");

var broadcast;
var dispatcher;
var currentMusic;
var voiceChannel;

const YoutubePlayHandler = {
    YoutubePlayHandler() {
        this.secure = true;

        this.ContentRegExpHandler(/^.ytplay/);
    },
    handle(message, client) {
        let params = message.content.split(" ");

        if (params.length >= 2) {
            if (broadcast) {
                broadcast.end();
            }

            if (!ytdl.validateLink(params[1])) {
                return;
            }

            let youtubeUrl = params[1];

            broadcast = client.createVoiceBroadcast();

            ytdl.getInfo(youtubeUrl.toString())
                .then(info => {
                    currentMusic = info.title;
                    client.user.setPresence({
                        game: {
                            name: currentMusic
                        }
                    });
                });

            message.guild.fetchMember(message)
                .then(guildMember => {
                    voiceChannel = guildMember.voiceChannel;

                    if (voiceChannel) {
                        voiceChannel.join()
                            .then(connection => {
                                const stream = ytdl(youtubeUrl.toString(), { filter: "audioonly" });
                                broadcast.playStream(stream, { seek: 0, volume: 0.05 });
                                dispatcher = connection.playBroadcast(broadcast);
                            })
                            .catch(console.error);
                    } else {
                        message.channel.send("You have to join a voice channel first!");
                    }

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

        this.ContentRegExpHandler(/^.ytpause/);
    },
    handle(message, client) {
        if (dispatcher) {
            dispatcher.pause();
            message.channel.send("Paused the music.");
            client.user.setPresence({
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

        this.ContentRegExpHandler(/^.ytresume/);
    },
    handle(message, client) {
        if (dispatcher) {
            dispatcher.resume();
            message.channel.send("Resumed the music.");
            client.user.setPresence({
                game: {
                    name: currentMusic
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
        
        this.ContentRegExpHandler(/^.ytstop/);
    },
    handle(message, client) {
        if (dispatcher) {
            dispatcher.end();
            if (broadcast) {
                broadcast.end();
                currentMusic = "";
                broadcast = undefined;
            }

            message.channel.send("Stopped the music.");
            client.user.setPresence({
                game: {
                    name: ""
                }
            });
            if (voiceChannel) {
                voiceChannel.leave();
            }
        } else {
            message.channel.send("There is no music to stop!");
        }
    }
};

Object.setPrototypeOf(YoutubeStopHandler, ContentRegExpHandler);

const VolumeHandler = {
    VolumeHandler() {
        this.secure = true;

        this.ContentRegExpHandler(/^.volume/);
    },
    handle(message) {
        let params = message.content.split(" ");

        if (params.length >= 2) {
            try {
                var volumePercent = parseInt(params[1]);
                if (volumePercent > 0 && volumePercent <= 100) {
                    if (broadcast) {
                        broadcast.setVolume(volumePercent / 100);
                    }
                }
            } catch (error) {
                console.log(error);
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
