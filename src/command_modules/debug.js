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
        secure: true,
        callback: function(message) {
            let msg = "Modules reloaded!\n";
            
            router.reloadModules().forEach(m =>  {
                msg += m + ": loaded!\n";
            });

            message.channel.send(msg);
        }
    }
];

module.exports = router.getRoutingFunction(_commands);
