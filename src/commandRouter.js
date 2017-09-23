var fs = require("fs");
var path = require("path");

var _modulePath = "./command_modules/";
var _prefix = ".";
var _moduleList;

function _handleMessage(message, client) {
    if (!_moduleList) {
        _loadModules();
    }

    for (let i = 0; i < _moduleList.length; ++i) {
        if (_moduleList[i](message, client)) {
            return;
        }
    }
}

function _loadModules() {
    _moduleList = [];

    fs.readdirSync(path.join(__dirname, _modulePath)).forEach(function(moduleName){
        if (!fs.lstatSync(path.join(__dirname, _modulePath, moduleName)).isFile() || moduleName.substring(0, 1) === ".") {
            return;
        }

        try {
            delete require.cache[require.resolve(_modulePath + moduleName)];
            _moduleList.push(require(_modulePath + moduleName));
        } catch (error) {
            console.log(error);
        }
    });
}

function _getRoutingFunction(commands) {
    return function(message, client){
        let command = commands.find(c => {
            return message.content.startsWith(_prefix + c.command);
        });
    
        if (command) {
            command.callback(message, client);
            return true;
        }
    
        return false;
    };
}

module.exports = {
    handleIncomingMessage: _handleMessage,
    reloadModules: _loadModules,
    getRoutingFunction: _getRoutingFunction,
};
