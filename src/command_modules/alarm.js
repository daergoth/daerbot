const Discord = require("discord.js");
const configuration = require("../configuration");
const ContentRegExpHandler = require("../content-regexp-handler");

function channelAlarmTimer(message, storage) {
    let channelAlarms = storage.getFromChannelLevel(message.channel, "alarms", true, []);

    let secondsLeft = 60;
    let alarmIndex = channelAlarms.findIndex(alarm => alarm.message === message);

    let embed = new Discord.RichEmbed()
        .setTitle(secondsLeft + "\"")
        .setDescription(channelAlarms[alarmIndex].description);

    message.channel.send(embed)
        .then(countingMessage => {
            let countdownInterval = setInterval(updateAlarmMessage, 5000, countingMessage);

            channelAlarms[alarmIndex].interval = countdownInterval;
            channelAlarms[alarmIndex].countdown = countingMessage;

            if (channelAlarms[alarmIndex].timeout) {
                clearTimeout(channelAlarms[alarmIndex].timeout);
            }

            function updateAlarmMessage(messageToUpdate) {
                secondsLeft -= 5;
                embed.setTitle(secondsLeft + "\"");
                messageToUpdate.edit(embed);

                if (secondsLeft <= 0 && countdownInterval) {
                    embed.setTitle("Alarm ended!");
                    messageToUpdate.edit(embed);

                    messageToUpdate.channel.send(embed)
                        .then(m => m.delete());
                    messageToUpdate.channel.send(embed)
                        .then(m => m.delete());
                    messageToUpdate.channel.send(embed)
                        .then(m => m.delete());

                    clearInterval(countdownInterval);
                    channelAlarms.splice(alarmIndex, 1);

                    storage.saveOnChannelLevel(message.channel, "alarms", channelAlarms);
                }
            }
        });
}

function selfAlarmTimer(message, storage) {

    message.author.createDM()
        .then(dm => {
            let userAlarms = storage.getFromUserLevel(message.author, "alarms", true, []);

            let secondsLeft = 60;
            let alarmIndex = userAlarms.findIndex(alarm => alarm.message === message);

            let embed = new Discord.RichEmbed()
                .setTitle(secondsLeft + "\"")
                .setDescription(userAlarms[alarmIndex].description);

            dm.send(embed)
                .then(countingMessage => {
                    let countdownInterval = setInterval(updateAlarmMessage, 5000, countingMessage);

                    userAlarms[alarmIndex].interval = countdownInterval;
                    userAlarms[alarmIndex].countdown = countingMessage;

                    if (userAlarms[alarmIndex].timeout) {
                        clearTimeout(userAlarms[alarmIndex].timeout);
                    }

                    function updateAlarmMessage(messageToUpdate) {
                        secondsLeft -= 5;
                        embed.setTitle(secondsLeft + "\"");
                        messageToUpdate.edit(embed);

                        if (secondsLeft <= 0 && countdownInterval) {
                            embed.setTitle("Alarm ended!");
                            messageToUpdate.edit(embed);

                            messageToUpdate.channel.send(embed)
                                .then(m => m.delete());
                            messageToUpdate.channel.send(embed)
                                .then(m => m.delete());
                            messageToUpdate.channel.send(embed)
                                .then(m => m.delete());

                            clearInterval(countdownInterval);
                            userAlarms.splice(alarmIndex, 1);

                            storage.saveOnUserLevel(message.author, "alarms", userAlarms);
                        }
                    }
                });
        });

}

const ChannelAlarmHandler = {
    ChannelAlarmHandler() {
        this.secure = true;

        this.ContentRegExpHandler(/^\.alarm/);
    },
    handle(message, storage) {
        let params = message.content.split(" ");
        if (params.length >= 2) {
            try {
                let alarmOffset = parseInt(configuration.getConfig("alarm.timezone", "0000"));

                let alarmInput = parseInt(params[1]);
                let alarmTime = new Date(Date.now());
                if (alarmTime.getHours() > alarmInput / 100) {
                    alarmTime.setDate(alarmTime.getDate() + 1);
                }
                alarmTime.setHours(alarmInput / 100 - alarmOffset / 100);
                alarmTime.setMinutes(alarmInput % 100 - alarmOffset % 100);

                let description = "Alarm";
                if (params.length >= 3) {
                    description = params.slice(2).join(" ");
                }

                let alarmTimeout = setTimeout(channelAlarmTimer, alarmTime.getTime() - Date.now() - 60000, message, storage);

                let channelAlarms = storage.getFromChannelLevel(message.channel, "alarms", true, []);
                channelAlarms.push({
                    message: message,
                    description: description,
                    timeout: alarmTimeout
                });
                storage.saveOnChannelLevel(message.channel, "alarms", channelAlarms);
            } catch (error) {
                console.log(error);
            }
        } else {
            message.channel.send("Need a time for the alarm! .alarm 2000 -> alarm at 20:00");
        }
    }
};

Object.setPrototypeOf(ChannelAlarmHandler, ContentRegExpHandler);

const AlarmHandler = {
    AlarmHandler() {
        this.canBeDM = true;

        this.ContentRegExpHandler(/^\.selfalarm/);
    },
    handle(message, storage) {
        let params = message.content.split(" ");
        if (params.length >= 2) {
            try {
                let alarmOffset = parseInt(configuration.getConfig("alarm.timezone", "0000"));

                let alarmInput = parseInt(params[1]);
                let alarmTime = new Date(Date.now());
                if (alarmTime.getHours() > alarmInput / 100) {
                    alarmTime.setDate(alarmTime.getDate() + 1);
                }
                alarmTime.setHours(alarmInput / 100 - alarmOffset / 100);
                alarmTime.setMinutes(alarmInput % 100 - alarmOffset % 100);

                let description = "Alarm";
                if (params.length >= 3) {
                    description = params.slice(2).join(" ");
                }

                let alarmTimeout = setTimeout(selfAlarmTimer, alarmTime.getTime() - Date.now() - 60000, message, storage);

                let userAlarms = storage.getFromUserLevel(message.author, "alarms", true, []);
                userAlarms.push({
                    message: message,
                    description: description,
                    timeout: alarmTimeout
                });
                storage.saveOnUserLevel(message.author, "alarms", userAlarms);

            } catch (error) {
                console.log(error);
            }
        } else {
            message.channel.send("Need a time for the alarm! .alarm 2000 -> alarm at 20:00");
        }
    }
};

Object.setPrototypeOf(AlarmHandler, ContentRegExpHandler);

const ClearChannelAlarmHandler = {
    ClearChannelAlarmHandler() {
        this.secure = true;

        this.ContentRegExpHandler(/^\.clearalarm/);
    },
    handle(message, storage) {
        let channelAlarms = storage.getFromChannelLevel(message.channel, "alarms", true, []);

        let alarmIndex = channelAlarms.findIndex(a => a.message.channel === message.channel);

        if (alarmIndex > -1) {
            message.channel.send(`Alarm cleared with description: '${channelAlarms[alarmIndex].description}'!`);

            if (channelAlarms[alarmIndex].countdown) {
                let embed = new Discord.RichEmbed()
                    .setTitle("Alarm cleared!")
                    .setDescription(channelAlarms[alarmIndex].description);

                channelAlarms[alarmIndex].countdown.edit(embed);
            }

            if (channelAlarms[alarmIndex].timeout) {
                clearTimeout(channelAlarms[alarmIndex].timeout);
            }

            if (channelAlarms[alarmIndex].interval) {
                clearInterval(channelAlarms[alarmIndex].interval);
            }

            channelAlarms.splice(alarmIndex, 1);
            storage.saveOnChannelLevel(message.channel, "alarms", channelAlarms);
        } else {
            message.channel.send("There was no alarm to clear!");
        }
    }
};

Object.setPrototypeOf(ClearChannelAlarmHandler, ContentRegExpHandler);

const ClearAlarmHandler = {
    ClearAlarmHandler() {
        this.canBeDM = true;

        this.ContentRegExpHandler(/^\.clearselfalarm/);
    },
    handle(message, storage) {
        let userAlarms = storage.getFromUserLevel(message.author, "alarms", true, []);

        let alarmIndex = userAlarms.findIndex(a => a.message.author === message.author);

        if (alarmIndex > -1) {
            message.channel.send(`Alarm cleared with description: '${userAlarms[alarmIndex].description}'!`);

            if (userAlarms[alarmIndex].countdown) {
                let embed = new Discord.RichEmbed()
                    .setTitle("Alarm cleared!")
                    .setDescription(userAlarms[alarmIndex].description);

                userAlarms[alarmIndex].countdown.edit(embed);
            }

            if (userAlarms[alarmIndex].timeout) {
                clearTimeout(userAlarms[alarmIndex].timeout);
            }

            if (userAlarms[alarmIndex].interval) {
                clearInterval(userAlarms[alarmIndex].interval);
            }

            userAlarms.splice(alarmIndex, 1);
            storage.saveOnUserLevel(message.author, "alarms", userAlarms);
        } else {
            message.channel.send("There was no alarm to clear!");
        }
    }
};

Object.setPrototypeOf(ClearAlarmHandler, ContentRegExpHandler);

const SetTimezoneHandler = {
    SetTimezoneHandler() {
        this.secure = true;

        this.ContentRegExpHandler(/^\.settimezone/);
    },
    handle(message) {
        let params = message.content.split(" ");

        if (params.length >= 2) {
            try {
                parseInt(params[1]);
                configuration.setConfig("alarm.timezone", params[1]);
                message.channel.send("Timezone set to " + params[1] + "!");
            } catch (error) {
                message.channel.send("Invalid timezone format! (0200 -> +02:00)");
            }
        }
    }
};

Object.setPrototypeOf(SetTimezoneHandler, ContentRegExpHandler);

function registerHandlers(registerFunction) {
    const channelAlarmHandler = Object.create(ChannelAlarmHandler);
    channelAlarmHandler.ChannelAlarmHandler();

    const alarmHandler = Object.create(AlarmHandler);
    alarmHandler.AlarmHandler();

    const clearChannelAlarmHandler = Object.create(ClearChannelAlarmHandler);
    clearChannelAlarmHandler.ClearChannelAlarmHandler();

    const clearAlarmHandler = Object.create(ClearAlarmHandler);
    clearAlarmHandler.ClearAlarmHandler();

    const setTimezoneHandler = Object.create(SetTimezoneHandler);
    setTimezoneHandler.SetTimezoneHandler();

    registerFunction(channelAlarmHandler);
    registerFunction(alarmHandler);
    registerFunction(clearChannelAlarmHandler);
    registerFunction(clearAlarmHandler);
    registerFunction(setTimezoneHandler);
}

module.exports = {
    registerHandlers
};