const escapeStringRegexp = require("escape-string-regexp");

const configuration = require("../configuration");
const ContentRegExpHandler = require("./content-regexp-handler");

const PrefixedContentRegExpHandler = {
    PrefixedContentRegExpHandler(regExp) {
        let prefix = configuration.getConfig("server.commandPrefix", ".");
        prefix = escapeStringRegexp(prefix);

        this.regExp = new RegExp("^" + prefix + regExp.source);
    }
};

Object.setPrototypeOf(PrefixedContentRegExpHandler, ContentRegExpHandler);

module.exports = PrefixedContentRegExpHandler;