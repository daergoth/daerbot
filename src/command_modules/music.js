var ytdl = require("ytdl-core");
var router = require("../commandRouter");

var _broadcast;
var _dispatcher;
var _currentMusic;
var _voiceChannel;

var _commands = [
    {
        command: "ytplay",
        secure: true,
        callback: function (message, client) {
            let params = message.content.split(" ");

            if (params.length >= 2) {
                if (_broadcast) {
                    _broadcast.end();
                }

                if (!ytdl.validateLink(params[1])) {
                    return;
                }

                let youtubeUrl = params[1];

                _broadcast = client.createVoiceBroadcast();

                ytdl.getInfo(youtubeUrl.toString())
                    .then(info => {
                        _currentMusic = info.title;
                        client.user.setPresence({
                            game: {
                                name: _currentMusic
                            }
                        });
                    });

                message.guild.fetchMember(message)
                    .then(guildMember => {
                        _voiceChannel = guildMember.voiceChannel;

                        if (_voiceChannel) {
                            _voiceChannel.join()
                                .then(connection => {
                                    const stream = ytdl(youtubeUrl.toString(), { filter: "audioonly" });
                                    _broadcast.playStream(stream, { seek: 0, volume: 0.05 });
                                    _dispatcher = connection.playBroadcast(_broadcast);
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
    },
    {
        command: "ytpause",
        secure: true,
        callback: function (message, client) {
            if (_dispatcher) {
                _dispatcher.pause();
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
    },
    {
        command: "ytresume",
        secure: true,
        callback: function (message, client) {
            if (_dispatcher) {
                _dispatcher.resume();
                message.channel.send("Resumed the music.");
                client.user.setPresence({
                    game: {
                        name: _currentMusic
                    }
                });
            } else {
                message.channel.send("There is no music to resume!");
            }
        }
    },
    {
        command: "ytstop",
        secure: true,
        callback: function (message, client) {
            if (_dispatcher) {
                _dispatcher.end();
                if (_broadcast) {
                    _broadcast.end();
                    _currentMusic = "";
                    _broadcast = undefined;
                }

                message.channel.send("Stopped the music.");
                client.user.setPresence({
                    game: {
                        name: ""
                    }
                });
                if (_voiceChannel) {
                    _voiceChannel.leave();
                }
            } else {
                message.channel.send("There is no music to stop!");
            }
        }
    },
    {
        command: "volume",
        secure: true,
        callback: function (message) {
            let params = message.content.split(" ");

            if (params.length >= 2) {
                try {
                    var volumePercent = parseInt(params[1]);
                    if (volumePercent > 0 && volumePercent <= 100) {
                        if (_broadcast) {
                            _broadcast.setVolume(volumePercent / 100);
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            } else {
                message.channel.send("Missing volume percentage!");
            }
        }
    }
];

module.exports = router.getRoutingFunction(_commands);
