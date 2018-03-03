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



function registerHandlers(registerFunction) {
    const pokeHandler = Object.create(PokeHandler);
    pokeHandler.PokeHandler();

    const pingHandler = Object.create(PingHandler);
    pingHandler.PingHandler();

    registerFunction(pokeHandler);
    registerFunction(pingHandler);
}

module.exports = {
    registerHandlers
};
