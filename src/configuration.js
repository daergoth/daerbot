const promisify = require("util").promisify;
const fs = require("fs");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const CONFIG_PATH = "./config.json";

let config = Object.create(null);

function reloadConfiguration(source = CONFIG_PATH) {
    return readFile(source)
        .then(contents => config = Object.assign(Object.create(null), JSON.parse(contents)));
}

function saveConfiguration(destination = CONFIG_PATH) {
    return writeFile(destination, JSON.stringify(config));
}

function getConfig(id, defaultValue) {
    if (Object.prototype.hasOwnProperty.call(config, id)) {
        return config[id];
    } else {
        return defaultValue;
    }
}

function setConfig(id, value) {
    config[id] = value;

    saveConfiguration();
}

module.exports = {
    getConfig,
    setConfig,
    reloadConfiguration
};