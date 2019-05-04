const notificationSoundPath = "../../resources/alarm.mp3";

const NotificationService = {

    notifyUser(user, times, messageStr = "Poke", before = () => {}) {
        let dmChannelPromise = undefined;
        if (user.dmChannel) {
            dmChannelPromise = new Promise((resolve) => resolve(user.dmChannel));
        } else {
            dmChannelPromise = user.createDM();
        }

        dmChannelPromise.then(channel => before(channel));
        
        dmChannelPromise
            .then(channel => { 
                for (let i = 0; i < times; ++i) {
                    channel.send(messageStr).then(message => message.delete());
                }
            });
      
        return dmChannelPromise;
    },

    notifyTextChannel(textChannel, times = 1, messageStr = "Alarm", before = () => {}) {
        before(textChannel);

        for (let i = 0; i < times; ++i) {
            textChannel.send(messageStr);
        }
      
        return textChannel;
    },

    notifyVoiceChannel(voiceChannel, notifySound = notificationSoundPath, before = () => {}) {
        before(voiceChannel);

        return voiceChannel.join()
            .then(connection => {
                const dispatcher = connection.playFile(notifySound);
            })
            .catch(err => voiceChannel.client.emit("error", `Notify voice channel error: ${err}`));
    }
};

module.exports = NotificationService;