var router = require("../commandRouter")

var _logChannelName = "log";
var _logStatus = false;

var _logListener = (oldMember, newMember) => {
    let logChannel = oldMember.guild.channels.find(c => c.name === _logChannelName);

    if (!logChannel) {
        oldMember.guild.createChannel(_logChannelName, "text")
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
            logChannel.send(`${oldMember.user} switched from ${oldMember.voiceChannel} to ${newMember.voiceChannel}`);
        }
    }

}

var _commands = [
    {
        "command": ".logToggle",
        "callback": function(message) {
            _logStatus = !_logStatus;
            if (_logStatus) {
                message.guild.client.on("voiceStateUpdate", _logListener);
            } else {
                message.guild.client.removeListener("voiceStateUpdate", _logListener);
            }

            message.channel.send(`Logging status: ${_logStatus}`);
        }
    }, 
    {
        "command": ".logStatus",
        "callback": function(message) {
            message.channel.send(`Logging status: ${_logStatus}`);
        }
    }
];

module.exports = router.getRoutingFunction(_commands);