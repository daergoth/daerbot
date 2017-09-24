var fs = require("fs");
var path = require("path");

var _modulePath = "./command_modules/";
var _prefix = ".";
var _authorizedRole = "DaerBot";
var _moduleList = undefined;

function _handleMessage(message, client) {
    if (!_moduleList) {
        _loadModules();
    }
    
    if (message.channel.type === "text") {
        for (let i = 0; i < _moduleList.length; ++i) {
            if (_moduleList[i](message, client)) {
                return;
            }
        }
    }
    
}

function _loadModules() {
    _moduleList = [];

    let moduleNames = [];

    fs.readdirSync(path.join(__dirname, _modulePath)).forEach(function (moduleName) {
        if (!fs.lstatSync(path.join(__dirname, _modulePath, moduleName)).isFile() || moduleName.substring(0, 1) === ".") {
            return;
        }

        try {
            delete require.cache[require.resolve(_modulePath + moduleName)];
            _moduleList.push(require(_modulePath + moduleName));
            moduleNames.push(moduleName);
        } catch (error) {
            console.log(error);
        }
    });

    return moduleNames;
}

function _getRoutingFunction(commands) {
    return function (message, client) {
        let command = commands.find(c => {
            return message.content.startsWith(_prefix + c.command);
        });

        if (command) {
            if (command.secure) {
                message.guild.fetchMember(message)
                    .then(guildMember => {
                        if(guildMember.roles.find(r => r.name === _authorizedRole)) {
                            command.callback(message, client);
                        } else {
                            message.channel.send("You don't have permission to use this command!");
                        }
                    });
            } else {
                command.callback(message, client);
            }

            console.log(new Date(message.createdTimestamp).toISOString() + " " + message.author.tag + " " + message.content);
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
