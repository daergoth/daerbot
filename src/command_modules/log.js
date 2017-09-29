const ContentRegExpHandler = require("../content-regexp-handler.js");
const configuration = require("../configuration");

var logChannelName = configuration.getConfig("log.channelName", "log");
var logStatus = configuration.getConfig("log.status", false);

var logListener = (oldMember, newMember) => {
    let logChannel = oldMember.guild.channels.find(c => c.name === logChannelName);

    if (!logChannel) {
        oldMember.guild.createChannel(logChannelName, "text")
            .then(textChannel => {
                console.log("Created channel: ", textChannel.name);  
                logChannel = textChannel;

                handleStatusUpdate();
            })
            .catch(error => console.log(error));
    } else {
        handleStatusUpdate();
    }

    function handleStatusUpdate() {
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

const LogToggleHandler = {
    LogToggleHandler() {
        this.secure = true;

        this.ContentRegExpHandler(/^.logtoggle/);
    },
    handle(message) {
        logStatus = !logStatus;
        configuration.setConfig("log.status", logStatus);

        if (logStatus) {
            message.guild.client.on("voiceStateUpdate", logListener);
        } else {
            message.guild.client.removeListener("voiceStateUpdate", logListener);
        }

        message.channel.send(`Logging status: ${logStatus}`);
    }
};

Object.setPrototypeOf(LogToggleHandler, ContentRegExpHandler);

const LogStatusHandler = {
    LogStatusHandler() {
        this.secure = true;

        this.ContentRegExpHandler(/^.logstatus/);
    },
    handle(message) {
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
