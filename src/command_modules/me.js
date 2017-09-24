var Discord = require("discord.js");
var fs = require("fs");
var router = require("../commandRouter");

var _alarms = [];

function _alarmTimer(message) {

    message.author.createDM()
        .then(dm => {
            let secondsLeft = 60;
            let alarmIndex = _alarms.findIndex(a => a.message === message);

            let embed = new Discord.RichEmbed()
                .setTitle(secondsLeft + "\"")
                .setDescription(_alarms[alarmIndex].description);

            dm.send(embed)
                .then(countingMessage => {
                    let countdownInterval = setInterval(updateAlarmMessage, 5000, countingMessage);

                    _alarms[alarmIndex].interval = countdownInterval;
                    _alarms[alarmIndex].countdown = countingMessage;

                    if (_alarms[alarmIndex].timeout) {
                        clearTimeout(_alarms[alarmIndex].timeout);
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
                            _alarms.splice(alarmIndex, 1);
                        }
                    }
                });
        });

}

var _commands = [
    {
        command: "playing",
        secure: true,
        callback: function (message, client) {
            let params = message.content.split(" ");

            if (params.length < 2) {
                message.channel.send("I'm playing " + client.user.presence.game.name);
            } else {
                client.user.setPresence({
                    game: {
                        name: params.slice(1).join(" ")
                    }
                });
            }
        }
    },
    {
        command: "say",
        callback: function (message) {
            let params = message.content.split(" ");
            if (params.length > 1) {
                message.channel.send(params.slice(1).join(" "));
                message.delete();
            }
        }
    },
    {
        command: "help",
        callback: function (message, client) {
            message.author.createDM()
                .then(dm => {
                    let embed = new Discord.RichEmbed()
                        .setTitle("Help")
                        .setDescription(fs.readFileSync("./README.md"))
                        .setAuthor("DaerBot", client.user.avatarUrl);
                    dm.send(embed);
                });
        }
    },
    {
        command: "alarm",
        callback: function (message) {
            let params = message.content.split(" ");
            if (params.length >= 2) {
                try {
                    let alarmInput = parseInt(params[1]);
                    let alarmTime = new Date(Date.now());
                    if (alarmTime.getHours() > alarmInput / 100) {
                        alarmTime.setDate(alarmTime.getDate() + 1);
                    }
                    alarmTime.setHours(alarmInput / 100);
                    alarmTime.setMinutes(alarmInput % 100);

                    let description = "Alarm";
                    if (params.length >= 3) {
                        description = params.slice(2).join(" ");
                    }

                    let alarmTimeout = setTimeout(_alarmTimer, alarmTime.getTime() - Date.now() - 60000, message);

                    _alarms.push({
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
    },
    {
        command: "clearalarm",
        callback: function (message) {
            let alarmIndex = _alarms.findIndex(a => a.message.author === message.author);

            if (alarmIndex > -1) {
                message.channel.send(`Alarm cleared with description: '${_alarms[alarmIndex].description}'!`);

                if (_alarms[alarmIndex].countdown) {
                    let embed = new Discord.RichEmbed()
                        .setTitle("Alarm cleared!")
                        .setDescription(_alarms[alarmIndex].description);

                    _alarms[alarmIndex].countdown.edit(embed);
                }

                if (_alarms[alarmIndex].timeout) {
                    clearTimeout(_alarms[alarmIndex].timeout);
                }

                if (_alarms[alarmIndex].interval) {
                    clearInterval(_alarms[alarmIndex].interval);
                }

                _alarms.splice(alarmIndex, 1);
            } else {
                message.channel.send("There was no alarm to clear!");
            }
        }
    }
];

module.exports = router.getRoutingFunction(_commands);