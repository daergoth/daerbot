const path = require('path');

const glob = require('glob');
const decache = require('decache');

const COMMAND_MODULE_GLOB = path.join(__dirname, 'command_modules', '*.js');

const emptyHandler = () => void 0;

Object.freeze(emptyHandler);

const Router = {
    Router(client) {
        this.client = client;
        
        this.commandModulePaths = [];
    },
    reloadCommandModules() {
        return new Promise(function (resolve, reject) {
            this.clearCommandModules();

            this.handlers = [];

            glob(COMMAND_MODULE_GLOB, function processResults(err, matches) {
                if (err) {
                    return reject(err);
                }

                matches.forEach(modulePath => this.registerCommandModule(modulePath));

                resolve();
            }.bind(this));
        }.bind(this));
    },
    clearCommandModules() {
        this.commandModulePaths.forEach(decache);

        this.commandModulePaths = [];
    },
    registerCommandModule(modulePath) {
        let commandModule;

        try {
            commandModule = require(modulePath);
        } catch (err) {
            console.log('Could not load module:', modulePath);

            return;
        }

        if (!Object.prototype.hasOwnProperty.call(commandModule, 'registerHandlers')) {
            console.log('Malformed command module:', modulePath);

            return;
        }

        // Could've used an arrow function to preserve the THIS, but preferred
        // the traditional function because this way the stack trace is going to be meaningful.
        commandModule.registerHandlers(function addHandler(handlerObject) {
            this.handlers.push(handlerObject);
        }.bind(this), this);

        this.commandModulePaths.push(modulePath);

        console.log('Loaded module:', modulePath);
    },
    route(message) {
        for (const handlerObject of this.handlers) {
            if (handlerObject.canHandle(message)) {
                return handlerObject.handle.bind(handlerObject, message);
            }
        }

        return emptyHandler;
    }
};

module.exports = Router;
