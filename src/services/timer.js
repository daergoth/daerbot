const moment = require("moment-timezone");
const default_guild_timezone = "GMT+2";

const TimerService = {

    getMillisUntilTime(targetTimeString) {
        let now = moment().tz(default_guild_timezone);
        console.log(`Now: ${now.format()}`);

        let target = moment(targetTimeString, ["h:m a", "H:m"]).tz(default_guild_timezone, true);
        console.log(`Target: ${target.format()}`);

        if (target.isAfter(now)) {
            console.log("Target is after Now");
            return target.diff(now);
        } else {
            return target.add(1, "day").diff(now);
        }
    },

    executeAfterMillis(millis, onSetOff = () => {}) {
        setTimeout(onSetOff, millis);
    }

};

module.exports = TimerService;