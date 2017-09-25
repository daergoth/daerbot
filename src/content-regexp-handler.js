const ContentRegExpHandler = {
    ContentRegExpHandler(regExp) {
        this.regExp = regExp;
    },
    canHandle(message) {
        return this.regExp.test(message.content);
    }
};

module.exports = ContentRegExpHandler;
