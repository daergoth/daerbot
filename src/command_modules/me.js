var router = require("../commandRouter");

var _commands = [
    {
        command: "playing",
        callback: function(message, client){
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
        callback: function(message) {
            let params = message.content.split(" ");
            if (params.length > 1) {
                message.channel.send(params.slice(1).join(" "));
            }
        }
    }
];

module.exports = router.getRoutingFunction(_commands);