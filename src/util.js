const Util = {
    sanatizeCommandInput(paramArray) {
        return paramArray
            .map((p) => {
                return p.trim();
            })
            .filter((p) => {
                return p.length > 0;
            });
    }
};

module.exports = Util;