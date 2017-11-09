const ContentRegExpHandler = {
    ContentRegExpHandler(regExp) {
        this.regExp = new RegExp(regExp.source + "($|\\s+)");
    },
    canHandle(message) {
        return this.regExp.test(message.content);
    }
};

module.exports = ContentRegExpHandler;
