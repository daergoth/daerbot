const promisify = require("util").promisify;
const ContentRegExpHandler = require("../content-regexp-handler.js");

const PokeHandler = {
    PokeHandler() {
        this.ContentRegExpHandler(/^\.poke/);
    },
    handle(message) {
        message.channel.send("Leave me alone, please.");
    }
};

Object.setPrototypeOf(PokeHandler, ContentRegExpHandler);

const PingHandler = {
    PingHandler() {
        this.ContentRegExpHandler(/^\.ping/);
    },
    handle(message) {
        message.channel.send("Pong.");
    }
};

Object.setPrototypeOf(PingHandler, ContentRegExpHandler);

const ReloadHandler = {
    ReloadHandler(router) {
        this.secure = true;
        this.router = router;

        this.ContentRegExpHandler(/^\.reload/);
    },
    handle(message, storage) {
        promisify(storage.persist())
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
            })
            .then(function modulesReloaded() {
                storage.load();
            });
    }
};

Object.setPrototypeOf(ReloadHandler, ContentRegExpHandler);

function registerHandlers(registerFunction, router) {
    const pokeHandler = Object.create(PokeHandler);
    pokeHandler.PokeHandler();

    const pingHandler = Object.create(PingHandler);
    pingHandler.PingHandler();

    const reloadHandler = Object.create(ReloadHandler);
    reloadHandler.ReloadHandler(router);

    registerFunction(pokeHandler);
    registerFunction(pingHandler);
    registerFunction(reloadHandler);
}

module.exports = {
    registerHandlers
};
