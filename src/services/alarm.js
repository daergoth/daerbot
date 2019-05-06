const timer = require("../services/timer");
const notification = require("../services/notification");

const AlarmService = {

    createTextAlarm(user, textChannel, targetTimeString, message) {
        let millis = timer.getMillisUntilTime(targetTimeString, user);
        timer.executeAfterMillis(millis, () => {
            notification.notifyTextChannel(textChannel, 1, message);
        });
        return millis;
    },

    createVoiceAlarm(user, voiceChannel, targetTimeString) {
        let millis = timer.getMillisUntilTime(targetTimeString, user);
        timer.executeAfterMillis(millis, () => {
            notification.notifyVoiceChannel(voiceChannel);
        });
        return millis;
    }

};

module.exports = AlarmService;