const path = require("path");

const glob = require("glob");

const COMMAND_MODULE_GLOB = path.join(__dirname, "command_modules", "*.js");

const Router = {
    Router() {
        this.commandModulePaths = [];
        this.preHandleHooks = [];
        this.postHandleHooks = [];
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

                resolve(this.commandModulePaths);
            }.bind(this));
        }.bind(this));
    },
    clearCommandModules() {
        this.commandModulePaths.forEach(p => delete require.cache[p]);

        this.commandModulePaths = [];
    },
    registerCommandModule(modulePath) {
        let commandModule;

        try {
            commandModule = require(modulePath);
        } catch (err) {
            console.log("Could not load module:", modulePath);

            return;
        }

        if (!Object.prototype.hasOwnProperty.call(commandModule, "registerHandlers")) {
            console.log("Malformed command module:", modulePath);

            return;
        }

        // Could've used an arrow function to preserve the THIS, but preferred
        // the traditional function because this way the stack trace is going to be meaningful.
        commandModule.registerHandlers(function addHandler(handlerObject) {
            this.handlers.push(handlerObject);
        }.bind(this), this);

        this.commandModulePaths.push(modulePath);

        console.log("Loaded module:", modulePath);
    },
    registerPreHandleHook(preHandleHookFunction) {
        this.preHandleHooks.push(preHandleHookFunction);
    },
    registerPostHandleHook(postHandleHookFunction) {
        this.postHandleHooks.push(postHandleHookFunction);
    },
    runPreHandleHooks(handlerObject, message) {
        return this.preHandleHooks.every(preHook => {
            return preHook(handlerObject, message);
        });
    },
    runPostHandleHooks(handlerObject, message) {
        return this.postHandleHooks.every(postHook => {
            return postHook(handlerObject, message);
        });
    },
    route(message) {
        for (const handlerObject of this.handlers) {
            if (handlerObject.canHandle(message)) {
                return handlerObject;
            }
        }

        return null;
    }
};

module.exports = Router;
