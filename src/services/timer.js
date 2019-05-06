const moment = require("moment-timezone");
const default_guild_timezone = "Europe/Budapest";

const storage = require("../services/storage");

const TimerService = {

    getMillisUntilTime(targetTimeString, user) {
        let timezone = storage.getFromUserLevel(user, "timezone", true, default_guild_timezone);

        let now = moment.tz();
        console.log(`Now: ${now.format()}`);

        let target = moment(targetTimeString, ["h:m a", "H:m"]).tz(timezone, true);
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