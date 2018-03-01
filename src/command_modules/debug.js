const PrefixedContentRegExpHandler = require("../matchers/prefixed-content-regexp-handler");

const PokeHandler = {
    PokeHandler() {
        this.PrefixedContentRegExpHandler(/poke/);
    },
    handle(message) {
        message.channel.send("Leave me alone, please.");
    }
};

Object.setPrototypeOf(PokeHandler, PrefixedContentRegExpHandler);

const PingHandler = {
    PingHandler() {
        this.PrefixedContentRegExpHandler(/ping/);
    },
    handle(message) {
        message.channel.send("Pong.");
    }
};

Object.setPrototypeOf(PingHandler, PrefixedContentRegExpHandler);

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
