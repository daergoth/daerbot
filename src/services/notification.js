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
    }
};

module.exports = NotificationService;