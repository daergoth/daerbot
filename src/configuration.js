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
    let path = id.split(".");
    let current = config;
    for (let i = 0; i < path.length - 1; ++i) {
        if (!Object.prototype.hasOwnProperty.call(current, path[i])) {
            current[path[i]] = Object.create(null);
        }

        current = current[path[i]];
    } 

    if (Object.prototype.hasOwnProperty.call(current, path[path.length - 1])) {
        return current[path[path.length - 1]];
    } else {
        return defaultValue;
    }
}

function setConfig(id, value) {
    let path = id.split(".");
    let current = config;
    for (let i = 0; i < path.length - 1; ++i) {
        if (!Object.prototype.hasOwnProperty.call(current, path[i])) {
            current[path[i]] = Object.create(null);
        }

        current = current[path[i]];
    } 

    current[path[path.length - 1]] = value;

    saveConfiguration();
}

module.exports = {
    getConfig,
    setConfig,
    reloadConfiguration
};