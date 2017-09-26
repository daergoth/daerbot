const Discord = require("discord.js");
const configuration = require("../configuration");
const ContentRegExpHandler = require("../content-regexp-handler");

var alarms = [];

function alarmTimer(message) {

    message.author.createDM()
        .then(dm => {
            let secondsLeft = 60;
            let alarmIndex = alarms.findIndex(a => a.message === message);

            let embed = new Discord.RichEmbed()
                .setTitle(secondsLeft + "\"")
                .setDescription(alarms[alarmIndex].description);

            dm.send(embed)
                .then(countingMessage => {
                    let countdownInterval = setInterval(updateAlarmMessage, 5000, countingMessage);

                    alarms[alarmIndex].interval = countdownInterval;
                    alarms[alarmIndex].countdown = countingMessage;

                    if (alarms[alarmIndex].timeout) {
                        clearTimeout(alarms[alarmIndex].timeout);
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
                            alarms.splice(alarmIndex, 1);
                        }
                    }
                });
        });

}

const AlarmHandler = {
    AlarmHandler() {
        this.ContentRegExpHandler(/^.alarm/);
    },
    handle(message) {
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

                let alarmTimeout = setTimeout(alarmTimer, alarmTime.getTime() - Date.now() - 60000, message);

                alarms.push({
                    message: message,
                    description: description,
                    timeout: alarmTimeout
                });
            } catch (error) {
                console.log(error);
            }
        } else {
            message.channel.send("Need a time for the alarm! .alarm 2000 -> alarm at 20:00");
        }
    }
};

Object.setPrototypeOf(AlarmHandler, ContentRegExpHandler);

const ClearAlarmHandler = {
    ClearAlarmHandler() {
        this.ContentRegExpHandler(/^.clearalarm/);
    },
    handle(message) {
        let alarmIndex = alarms.findIndex(a => a.message.author === message.author);

        if (alarmIndex > -1) {
            message.channel.send(`Alarm cleared with description: '${alarms[alarmIndex].description}'!`);

            if (alarms[alarmIndex].countdown) {
                let embed = new Discord.RichEmbed()
                    .setTitle("Alarm cleared!")
                    .setDescription(alarms[alarmIndex].description);

                alarms[alarmIndex].countdown.edit(embed);
            }

            if (alarms[alarmIndex].timeout) {
                clearTimeout(alarms[alarmIndex].timeout);
            }

            if (alarms[alarmIndex].interval) {
                clearInterval(alarms[alarmIndex].interval);
            }

            alarms.splice(alarmIndex, 1);
        } else {
            message.channel.send("There was no alarm to clear!");
        }
    }
};

Object.setPrototypeOf(ClearAlarmHandler, ContentRegExpHandler);

const SetTimezoneHandler = {
    SetTimezoneHandler() {
        this.ContentRegExpHandler(/^.settimezone/);
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
    const alarmHandler = Object.create(AlarmHandler);
    alarmHandler.AlarmHandler();

    const clearAlarmHandler = Object.create(ClearAlarmHandler);
    clearAlarmHandler.ClearAlarmHandler();

    const setTimezoneHandler = Object.create(SetTimezoneHandler);
    setTimezoneHandler.SetTimezoneHandler();

    registerFunction(alarmHandler);
    registerFunction(clearAlarmHandler);
    registerFunction(setTimezoneHandler);
}

module.exports = {
    registerHandlers
};