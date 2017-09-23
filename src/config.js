var fs = require("fs");

var configPath = "./config.json";

var _config = _loadConfigs();

function _loadConfigs() {
    if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath));
    } else {
        return {};
    }
}

function _saveConfigs() {
    fs.writeFileSync(configPath, JSON.stringify(_config));
}

function _getConfig(id, defaultValue) {
    if (_config[id] !== undefined) {
        return _config[id];
    } else {
        return defaultValue;
    }
}

function _setConfig(id, value) {
    _config[id] = value;

    _saveConfigs();
}

module.exports = {
    getConfig: _getConfig,
    setConfig: _setConfig,
};