var router = require("../commandRouter");

var _commands = [
    {
        command:"poke",
        callback: function(message){
            message.channel.send("Leave me alone, please.");
        }
    }, 
    {
        command:"ping",
        callback: function(message) {
            message.channel.send("Pong.");
        }
    },
    {
        command:"reload",
        callback: function(message) {
            router.reloadModules();
            message.channel.send("Modules reloaded!");
        }
    }
];

module.exports = router.getRoutingFunction(_commands);
