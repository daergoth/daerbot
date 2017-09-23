var Discord = require("discord.js");
var config = require("../config");
var router = require("../commandRouter");

var CSGO_ICON_URL = config.getConfig("gather.csgo.image","https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/730/d0595ff02f5c79fd19b06f4d6165c3fda2372820.jpg");
var LOL_ICON_URL = config.getConfig("gather.lol.image","http://vignette1.wikia.nocookie.net/leagueoflegends/images/8/86/League_of_legends_logo_transparent.png");
var DEFAULT_CSGO_TITLE = config.getConfig("gather.csgo.title","CS:GO Matchmaking?");
var DEFAULT_LOL_TITLE = config.getConfig("gather.lol.title","LoL Ranked?");

var _isCSGO = false;
var _isLoL = false;

var _isGathering = false;
var _starterMessage;

var _gatherMessages = [];
var _currentRichEmbed;

var _playerList = [];
var _joinListener = function (message) {
    if (message.content === "+" && !_playerList.includes(message.author)) {
        _playerList.push(message.author);

        _currentRichEmbed.addField("\u200B", _playerList.length + " - " + message.author);

        _gatherMessages.forEach(gM => gM.edit(_currentRichEmbed));

        message.delete(2000);
    }
};
var _endTimeout;

function _sendGatherStatus(message) {
    if (_currentRichEmbed === undefined) {
        let title = "";
        if (message.content.split(" ").length > 1) {
            title = message.content.split(" ")[1];
        } else {
            if (_isCSGO) {
                title = DEFAULT_CSGO_TITLE;
            } else if (_isLoL) {
                title = DEFAULT_LOL_TITLE;
            }
        }

        _currentRichEmbed = new Discord.RichEmbed()
            .setAuthor(_starterMessage.author.username, _starterMessage.author.avatarURL)
            .setTitle(title)
            .setDescription("Type '+' to join this gathering!")
            .setColor([255, 0, 0]);

        for (let i = 0; i < _playerList.length; ++i) {
            _currentRichEmbed.addField("\u200B", i + 1 + " - " + _playerList[i]);
        }

        if (_isCSGO) {
            _currentRichEmbed.setThumbnail(CSGO_ICON_URL);
        } else if (_isLoL) {
            _currentRichEmbed.setThumbnail(LOL_ICON_URL);
        }
    }

    message.channel.send(_currentRichEmbed)
        .then(m => _gatherMessages.push(m));
}

function _clearGathering(message, client) {
    if (!_isGathering) {
        return;
    }

    client.removeListener("message", _joinListener);
    clearTimeout(_endTimeout);

    _currentRichEmbed.setFooter("ENDED!");
    message.channel.send(_currentRichEmbed);
    _gatherMessages.forEach(gM => gM.edit(_currentRichEmbed));

    _starterMessage = undefined;
    _isGathering = false;
    _currentRichEmbed = undefined;
    _playerList = [];
    _gatherMessages = [];
    _isCSGO = false;
    _isLoL = false;
}

function _doGather(message, client) {
    _starterMessage = message;

    _sendGatherStatus(message);

    client.on("message", _joinListener);

    _isGathering = true;

    // 5 min timeout to auto-stop gathering
    _endTimeout = setTimeout(_clearGathering, 300000, message, client);
}

var _commands = [
    {
        command: "gatherend",
        callback: function (message, client) {
            _clearGathering(message, client);
        }
    },
    {
        command: "gather",
        callback: function (message, client) {
            let params = message.content.split(" ");

            if (params.length >= 2) {
                _doGather(message, client);
            } else {
                if (_isGathering) {
                    _sendGatherStatus(message);
                } else {
                    message.channel.send("Invalid command! .gather Question?");
                }
            }
        }
    },
    {
        command: "csgo?",
        callback: function (message, client) {
            if (_isGathering) {
                _sendGatherStatus(message);
            } else {
                _isCSGO = true;

                _doGather(message, client);
            }
        }
    },
    {
        command: "lol?",
        callback: function (message, client) {
            if (_isGathering) {
                _sendGatherStatus(message);
            } else {
                _isLoL = true;

                _doGather(message, client);
            }
        }
    }
];

module.exports = router.getRoutingFunction(_commands);
