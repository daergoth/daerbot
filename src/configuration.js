const promisify = require("util").promisify;
const fs = require("fs");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const CONFIG_PATH = "./config.json";

const ConfigurationManager = {
    ConfigurationManager() {
        this.config = Object.create(null);
        return this;
    },

    reloadConfiguration(source = CONFIG_PATH) {
        return readFile(source)
            .then(content => this.config = Object.assign(Object.create(null), JSON.parse(content)));
    },
    
    saveConfiguration(destination = CONFIG_PATH) {
        return writeFile(destination, JSON.stringify(this.config));
    },
    
    getConfig(id, defaultValue) {
        let path = id.split(".");
        let current = this.config;
        for (let i = 0; i < path.length - 1; ++i) {
            if (!(path[i] in current)) {
                current[path[i]] = Object.create(null);
            }
            
            current = current[path[i]];
        } 
            
        if (path[path.length - 1] in current) {
            return current[path[path.length - 1]];
        } else {
            return defaultValue;
        }
    },
    
    setConfig(id, value) {
        let path = id.split(".");
        let current = this.config;
        for (let i = 0; i < path.length - 1; ++i) {
            if (!(path[i] in current)) {
                current[path[i]] = Object.create(null);
            }
    
            current = current[path[i]];
        } 
    
        current[path[path.length - 1]] = value;
    
        this.saveConfiguration();
    }
};

module.exports = ConfigurationManager;