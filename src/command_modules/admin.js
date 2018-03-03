const configuration = require("../configuration");
const util = require("../util");
const PrefixedContentRegExpHandler = require("../matchers/prefixed-content-regexp-handler");
const ContentRegExpHandler = require("../matchers/content-regexp-handler");

const PrefixChangeHandler = {
    PrefixChangeHandler() {
        this.secure = true;

        this.ContentRegExpHandler(/^\.prefix/);
    },
    handle(message) {
        let params = util.sanatizeCommandInput(message.content.split(" "));

        if (params.length >= 2) {
            // Prefix change
            let newPrefix = params[1];

            configuration.setConfig("server.commandPrefix", newPrefix);

            message.channel.send("The new command prefix: \"" + newPrefix + "\"");
        } else {
            // Prefix display
            let prefix = configuration.getConfig("server.commandPrefix");

            message.channel.send("The current command prefix: \"" + prefix + "\"");
        }

    }
};

Object.setPrototypeOf(PrefixChangeHandler, ContentRegExpHandler);

const ReloadHandler = {
    ReloadHandler(router) {
        this.secure = true;
        this.router = router;

        this.PrefixedContentRegExpHandler(/reload/);
    },
    handle(message, storage) {
        storage.persist()
            .then(function storagePersisted() {
                this.router.reloadCommandModules()
                    .then(function success(modulePaths) {
                        let msg = "Modules reloaded!\n";
                        modulePaths.forEach(path => msg += (path.split(/[\\|/]/).pop() + ": loaded!\n"));
                        message.channel.send(msg);
                    })
                    .catch(function failure(err) {
                        message.channel.send("Failed to reload modules!");
                        console.warn(`Failed .reload: ${err}`);
                    });
            }.bind(this))
            .then(function modulesReloaded() {
                storage.load();
            });
    }
};

Object.setPrototypeOf(ReloadHandler, PrefixedContentRegExpHandler);

function registerHandlers(registerFunction, router) {
    const prefixChangeHandler = Object.create(PrefixChangeHandler);
    prefixChangeHandler.PrefixChangeHandler();

    const reloadHandler = Object.create(ReloadHandler);
    reloadHandler.ReloadHandler(router);

    registerFunction(prefixChangeHandler);
    registerFunction(reloadHandler);
}

module.exports = {
    registerHandlers
};
