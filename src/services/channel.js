const storage = require("./storage");

const ChannelService = {

    CustomChannelRemoverListener: {

        _channelRemoveListener(oldMember, newMember) {
            let channelIDs = storage.getFromGuildLevel(oldMember.guild, "customChannels.channels", true, []);
            let oldChannel = oldMember.voiceChannel;

            if (oldChannel && channelIDs.includes(oldChannel.id)) {
                if (oldChannel.members.size === 0) {
                    oldChannel.delete()
                        .catch(error => oldChannel.client.emit("error", `Error during custom channel delete: ${error}`));
                }
            }
        },

        start(guild) {
            let currentStatus = storage.getFromGuildLevel(guild, "customChannels.listenerStarted", true, false);

            if (!currentStatus) {
                storage.saveOnGuildLevel(guild, "customChannels.listenerStarted", true);
                storage.saveOnGuildLevel(guild, "customChannels.channels", []);     
                
                if (!guild.client.listeners("voiceStateUpdate").includes(ChannelService.CustomChannelRemoverListener._channelRemoveListener)) {
                    guild.client.on("voiceStateUpdate", ChannelService.CustomChannelRemoverListener._channelRemoveListener);
                }
            } 
        },

        stop(guild) {
            let currentStatus = storage.getFromGuildLevel(guild, "customChannels.listenerStarted", true, false);

            if (currentStatus) {
                storage.saveOnGuildLevel(guild, "customChannels.listenerStarted", false);

                if (guild.client.listeners("voiceStateUpdate").includes(ChannelService.CustomChannelRemoverListener._channelRemoveListener)) {
                    guild.client.removeListener("voiceStateUpdate", ChannelService.CustomChannelRemoverListener._channelRemoveListener);
                }
            } 
            
        },

        addChannel(guild, customChannel) {
            storage.getFromGuildLevel(guild, "customChannels.channels").push(customChannel.id);
        },

        removeChannel(guild, customChannel) {
            let channelIDs = storage.getFromGuildLevel(guild, "customChannels.channels");
            channelIDs.splice(channelIDs.findIndex(customChannel.id), 1);
        }
    },

    createPersonalChannel(owner, channelType) {
        let categoryChannelPromise = 
            new Promise(resolve => resolve(owner.guild.channels.filter(channel => channel.name === "Custom Channels" && channel.type === "category")));

        categoryChannelPromise
            .then(catChannel => {
                if (catChannel.size === 0) {
                    return owner.guild.createChannel("Custom Channels", "category");
                } else {
                    return catChannel.first();
                }
            })
            .then(catChannel => {
                owner.guild.createChannel(owner.displayName + "-custom-channel", channelType)
                    .then(customChannel => {
                        customChannel.setParent(catChannel);
                        return customChannel;
                    })
                    .then(customChannel => {
                        ChannelService.CustomChannelRemoverListener.start(customChannel.guild);
                        ChannelService.CustomChannelRemoverListener.addChannel(customChannel.guild, customChannel);
                        return customChannel;
                    })
                    .then(customChannel => {
                        owner.setVoiceChannel(customChannel);
                    })
                    .catch(error => owner.client.emit("error", `Error during custom channel creation: ${error}`));
            })
            .catch(error => owner.client.emit("error", `Error during custom channel category creation: ${error}`));
    },

};

module.exports = ChannelService;