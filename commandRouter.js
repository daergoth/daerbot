var requiredir = require("requiredir");
var path = require("path");

var _modulePath = "command_modules";
var _moduleList;

function _handleMessage(message) {
    if (!_moduleList) {
        _loadModules();
    }

    for (let i = 0; i < _moduleList.length; ++i) {
        if (_moduleList.toArray()[i](message)) {
            return;
        }
    }
}

function _loadModules() {
    _moduleList = requiredir(path.join(__dirname, _modulePath));
}

function _getRoutingFunction(commands) {
    return function(message){
        let command = commands.find(c => {
            return message.content.startsWith(c.command);
        });
    
        if (command) {
            command.callback(message);
            return true;
        }
    
        return false;
    }
}

module.exports = {
    "handleIncomingMessage": _handleMessage,
    "reloadModules": _loadModules,
    "getRoutingFunction": _getRoutingFunction,
};
