const ContentRegexpHandler = require("./content-regexp-handler");

const PrefixedContentRegexpHandler = {
    PrefixedContentRegexpHandler(regExp) {
        this.regExp = new RegExp("^\\." + regExp.source);
    }
};

Object.setPrototypeOf(PrefixedContentRegexpHandler, ContentRegexpHandler);

module.exports = PrefixedContentRegexpHandler;