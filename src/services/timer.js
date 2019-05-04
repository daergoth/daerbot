const moment = require("moment-timezone");
const default_guild_timezone = "GMT+2";

const TimerService = {

    getMillisUntilTime(targetTimeString) {
        let nowUtc = moment().utc();
        console.log(`Now UTC: ${nowUtc.format()}`);

        let targetUtc = moment(targetTimeString, ["h:m a", "H:m"]).tz(default_guild_timezone).utc();
        console.log(`Target UTC: ${targetUtc.format()}`);

        if (targetUtc.isAfter(nowUtc)) {
            console.log("Target UTC is after Now UTC");
            return targetUtc.diff(nowUtc);
        } else {
            return targetUtc.add(1, "day").diff(nowUtc);
        }
    },

    executeAfterMillis(millis, onSetOff = () => {}) {
        setTimeout(onSetOff, millis);
    }

};

module.exports = TimerService;