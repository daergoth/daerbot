const configuration = require("../configuration");
const ContentRegExpHandler = require("../content-regexp-handler.js");

const LogToggleHandler = {
    LogToggleHandler() {
        this.secure = true;

        this.ContentRegExpHandler(/^\.logtoggle/);
    },
    handle(message, storage) {
        let logStatus = storage.getFromGuildLevel(message.guild, "log.status", true,
            configuration.getConfig("log.status", true));

        logStatus = !logStatus;

        storage.saveOnGuildLevel(message.guild, "log", {
            status: logStatus
        });

        let logListener = (oldMember, newMember) => {
            let logStatus = storage.getFromGuildLevel(oldMember.guild, "log.status", true, true);
            
            if (logStatus) {
                let logChannelName = storage.getFromGuildLevel(oldMember.guild, "log.channelName", true,
                    configuration.getConfig("log.channelName", "log"));
                let logChannel = oldMember.guild.channels.find(c => c.name === logChannelName);

                if (!logChannel) {
                    oldMember.guild.createChannel(logChannelName, "text")
                        .then(textChannel => {
                            console.log("Created channel: ", textChannel.name);
                            logChannel = textChannel;

                            handleStatusUpdate(logChannel);
                        })
                        .catch(error => console.log("Error while creating log channel: " + error));
                } else {
                    handleStatusUpdate(logChannel);
                }
            }

            function handleStatusUpdate(logChannel) {
                if (!oldMember.voiceChannel) {
                    logChannel.send(`${oldMember.user} connected to ${newMember.voiceChannel}!`);
                } else if (!newMember.voiceChannel) {
                    logChannel.send(`${oldMember.user} disconnected from ${oldMember.voiceChannel}!`);
                } else {
                    if (oldMember.voiceChannel != newMember.voiceChannel) {
                        logChannel.send(`${oldMember.user} switched from ${oldMember.voiceChannel} to ${newMember.voiceChannel}`);
                    }
                }
            }
        };

        if (logStatus) {
            if (!message.client.listeners("voiceStateUpdate").includes(logListener)) {
                message.client.on("voiceStateUpdate", logListener);
            }
        } else {
            message.client.removeListener("voiceStateUpdate", logListener);
        }

        message.channel.send(`Logging status: ${logStatus}`);
    }
};

Object.setPrototypeOf(LogToggleHandler, ContentRegExpHandler);

const LogStatusHandler = {
    LogStatusHandler() {
        this.secure = true;

        this.ContentRegExpHandler(/^\.logstatus/);
    },
    handle(message, storage) {
        let logStatus = storage.getFromGuildLevel(message.guild, "log.status", true,
            configuration.getConfig("log.status", true));

        message.channel.send(`Logging status: ${logStatus}`);
    }
};

Object.setPrototypeOf(LogStatusHandler, ContentRegExpHandler);

function registerHandlers(registerFunction) {
    const logToggleHandler = Object.create(LogToggleHandler);
    logToggleHandler.LogToggleHandler();

    const logStatusHandler = Object.create(LogStatusHandler);
    logStatusHandler.LogStatusHandler();

    registerFunction(logToggleHandler);
    registerFunction(logStatusHandler);
}

module.exports = {
    registerHandlers
};
