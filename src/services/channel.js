const Discord = require("discord.js");
const Permissions = Discord.Permissions;
const Collection = Discord.Collection;
const storage = require("./storage");

const ChannelService = {

    CustomChannelHandler: {

        _channelRemoveListener(oldMember, newMember) {
            let channels = storage.getFromGuildLevel(oldMember.guild, "customChannels.channels", true, new Collection());
            let oldChannel = oldMember.voiceChannel;

            if (oldChannel && channels.has(oldChannel.id)) {
                if (oldChannel.members.size === 0) {
                    ChannelService.CustomChannelHandler.removeChannel(oldChannel);
                }
            }
        },

        _deleteCustomChannel(channel) {
            channel.delete()
                .catch(error => channel.client.emit("error", `Error during custom channel delete: ${error}`));
        },

        startListener(guild) {
            let currentStatus = storage.getFromGuildLevel(guild, "customChannels.listenerStarted", true, false);

            if (!currentStatus) {
                storage.saveOnGuildLevel(guild, "customChannels.listenerStarted", true);
                storage.saveOnGuildLevel(guild, "customChannels.channels", new Collection());     
                
                if (!guild.client.listeners("voiceStateUpdate").includes(ChannelService.CustomChannelHandler._channelRemoveListener)) {
                    guild.client.on("voiceStateUpdate", ChannelService.CustomChannelHandler._channelRemoveListener);
                }
            } 
        },

        stopListener(guild) {
            let currentStatus = storage.getFromGuildLevel(guild, "customChannels.listenerStarted", true, false);

            if (currentStatus) {
                storage.saveOnGuildLevel(guild, "customChannels.listenerStarted", false);

                if (guild.client.listeners("voiceStateUpdate").includes(ChannelService.CustomChannelHandler._channelRemoveListener)) {
                    guild.client.removeListener("voiceStateUpdate", ChannelService.CustomChannelHandler._channelRemoveListener);
                }
            } 
            
        },

        addChannel(owner, customChannel, isPrivate = false, invitees = [owner]) {
            let channels = storage.getFromGuildLevel(owner.guild, "customChannels.channels");
            let ownersChannel = channels.find(channel => channel.owner.id === owner.id);

            if (ownersChannel) {
                owner.client.emit("warn", `${owner.displayName} created a new personal channel, while they had one already!`);

                ChannelService.CustomChannelHandler.removeChannel(ownersChannel);
            }

            channels.set(customChannel.id, {
                channel: customChannel,
                isPrivate: isPrivate,
                owner: owner,
                invitees: invitees
            });
        },

        removeChannel(customChannel) {
            let channels = storage.getFromGuildLevel(customChannel.guild, "customChannels.channels");
            channels.delete(customChannel.id);
            ChannelService.CustomChannelHandler._deleteCustomChannel(customChannel);
        },

        addInvitee(owner, customChannel, invitee) {
            let channels = storage.getFromGuildLevel(owner.guild, "customChannels.channels");
            let channel = channels.get(customChannel.id);

            if (channel.isPrivate) {
                channel.invitees.push(invitee.id);
                customChannel.replacePermissionOverwrites({overwrites: ChannelService._createPrivatePermissions(channel.invitees)});
            }
        }
    },

    _createPrivatePermissions(invitedList) {
        let everyoneRole = invitedList[0].guild.roles.find(role => role.name === "@everyone");
        let result = [{denied: Permissions.ALL, id: everyoneRole}, {allowed: Permissions.ALL, id: invitedList[0].client.user.id}];

        invitedList.forEach(invitee => result.push({allowed: Permissions.DEFAULT, id: invitee}));

        return result;
    },

    createPersonalChannel(owner, channelType, autoMove = true, isPrivate = false) {
        let categoryChannelPromise = 
            new Promise(resolve => resolve(owner.guild.channels.filter(channel => channel.name === "Personal Channels" && channel.type === "category")));

        return categoryChannelPromise
            .then(catChannel => {
                if (catChannel.size === 0) {
                    return owner.guild.createChannel("Personal Channels", "category");
                } else {
                    return catChannel.first();
                }
            })
            .then(catChannel => {
                let channelSuffix = isPrivate ? "-private-channel": "-personal-channel";
                return owner.guild.createChannel(owner.displayName + channelSuffix, channelType)
                    .then(customChannel => {
                        if (isPrivate) {
                            customChannel.replacePermissionOverwrites({overwrites: ChannelService._createPrivatePermissions([owner])});
                        }
                        return customChannel;
                    })
                    .then(customChannel => {
                        customChannel.setParent(catChannel);
                        return customChannel;
                    })
                    .then(customChannel => {
                        ChannelService.CustomChannelHandler.startListener(customChannel.guild);
                        ChannelService.CustomChannelHandler.addChannel(owner, customChannel, isPrivate);
                        return customChannel;
                    })
                    .then(customChannel => {
                        if (autoMove) {
                            owner.setVoiceChannel(customChannel);
                        }
                        return customChannel;                        
                    })
                    .catch(error => owner.client.emit("error", `Error during custom channel creation: ${error}`));
            })
            .catch(error => owner.client.emit("error", `Error during custom channel category creation: ${error}`));
    },

    inviteToPrivateChannel(owner, invitee, customChannel = null) {
        if (!customChannel) {
            customChannel = storage.getFromGuildLevel(owner.guild, "customChannels.channels")
                .find(storedChannel => storedChannel.owner.id === owner.id).channel;
        }

        ChannelService.CustomChannelHandler.addInvitee(owner, customChannel, invitee);
    }

};

module.exports = ChannelService;