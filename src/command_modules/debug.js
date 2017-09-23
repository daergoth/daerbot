var router = require("../commandRouter")

var _commands = [
    {
        "command":"ping",
        "callback": (message) => {
            message.channel.send("pong");
        }
    }
];

module.exports = router.getRoutingFunction(_commands);
