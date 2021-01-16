import { CategoryChannel, Collection, Guild, GuildChannel, GuildMember, OverwriteData, VoiceChannel, VoiceState } from "discord.js";
import { DiscordBasedStorage } from "./storage";

export enum ChannelType {
    TEXT = "text",
    VOICE = "voice"
}

export class ChannelService {
    private static instance: ChannelService;

    private constructor() {}

    public static getInstance() {
        if(!this.instance) {
            this.instance = new ChannelService();
        }
        return this.instance;
    }

    public createPersonalChannel(owner: GuildMember, channelType: ChannelType, autoMove = true, isPrivate = false) {
        const categoryChannelPromise =
            new Promise<Collection<string, GuildChannel>>(resolve =>
                resolve(owner.guild.channels.cache.filter(channel => channel.name === "Personal Channels" && channel.type === "category")));

        const newChannel = categoryChannelPromise
            .then(catChannel => {
                if (catChannel.size === 0) {
                    return owner.guild.channels.create("Personal Channels", {
                        type: "category"
                    });
                } else {
                    return catChannel.first() as CategoryChannel;
                }
            })
            .then(catChannel => {
                const channelSuffix = isPrivate ? "-private-channel": "-personal-channel";
                const newChannelPromise = owner.guild.channels.create(owner.displayName + channelSuffix, {type: channelType})
                    .then(customChannel => {
                        customChannel.setParent(catChannel);
                        return customChannel;
                    })
                    .then(customChannel => {
                        if (isPrivate) {
                            customChannel.overwritePermissions(this.createPrivatePermissions([owner]));
                        }
                        return customChannel;
                    })
                    .then(customChannel => {
                        this.startListener(customChannel.guild);
                        this.addChannel(owner, customChannel, isPrivate);
                        return customChannel;
                    })
                    .then(customChannel => {
                        if (autoMove && customChannel instanceof VoiceChannel && owner.voice.channelID) {
                            owner.voice.setChannel(customChannel);
                        }
                        return customChannel;
                    });

                newChannelPromise.catch(error => owner.client.emit("error", new Error(`Error during custom channel creation: ${error}`)));

                return newChannelPromise;
            });

            newChannel.catch(error => owner.client.emit("error", new Error(`Error during custom channel category creation: ${error}`)));

            return newChannel;
    }

    public inviteToPrivateChannel(owner: GuildMember, invitee: GuildMember, customChannel: GuildChannel = null) {
        const storage = DiscordBasedStorage.getInstance();
        if (!customChannel) {
            customChannel = storage.getFromGuildLevel(owner.guild, "customChannels.channels")
                .find(storedChannel => storedChannel.owner.id === owner.id).channel;
        }

        this.addInvitee(owner, customChannel, invitee);
    }

    private createPrivatePermissions(invitedList: GuildMember[]): OverwriteData[] {
        const result: OverwriteData[] = [
            {
                id: invitedList[0].guild.id,
                deny: "VIEW_CHANNEL"
            },
            {
                id: invitedList[0].client.user.id,
                allow: "VIEW_CHANNEL"
            }
        ];

        invitedList.forEach(invitee => result.push({id: invitee.id, allow: "VIEW_CHANNEL"}));

        return result;
    }

    private channelRemoveListener(oldState: VoiceState, newState: VoiceState) {
        const storage = DiscordBasedStorage.getInstance();
        const service = ChannelService.getInstance();
        const channels = storage.getFromGuildLevel(oldState.guild, "customChannels.channels", true, new Collection<string, any>());
        const oldChannel = oldState.channel;

        if (oldChannel && channels.has(oldChannel.id)) {
            if (oldChannel.members.size === 0) {
                service.removeChannel(oldChannel);
            }
        }
    }

    private deleteCustomChannel(channel: GuildChannel) {
        setTimeout(() => {
            channel.delete()
                .catch(error => channel.client.emit("error", new Error(`Error during custom channel delete: ${error}`)));
        }, 1000);
    }

    private startListener(guild: Guild) {
        const storage = DiscordBasedStorage.getInstance();
        const currentStatus = storage.getFromGuildLevel(guild, "customChannels.listenerStarted", true, false);

        if (!currentStatus) {
            storage.saveOnGuildLevel(guild, "customChannels.listenerStarted", true);
            storage.saveOnGuildLevel(guild, "customChannels.channels", new Collection<string, any>());

            if (!guild.client.listeners("voiceStateUpdate").includes(this.channelRemoveListener)) {
                guild.client.on("voiceStateUpdate", this.channelRemoveListener);
            }
        }
    }

    private stopListener(guild: Guild) {
        const storage = DiscordBasedStorage.getInstance();
        const currentStatus = storage.getFromGuildLevel(guild, "customChannels.listenerStarted", true, false);

        if (currentStatus) {
            storage.saveOnGuildLevel(guild, "customChannels.listenerStarted", false);

            if (guild.client.listeners("voiceStateUpdate").includes(this.channelRemoveListener)) {
                guild.client.removeListener("voiceStateUpdate", this.channelRemoveListener);
            }
        }

    }

    private addChannel(owner: GuildMember, customChannel: GuildChannel, isPrivate = false, invitees = [owner]) {
        const storage = DiscordBasedStorage.getInstance();
        const channels = storage.getFromGuildLevel(owner.guild, "customChannels.channels") as Collection<string, any>;
        const ownersChannel = channels.find(channel => channel.owner.id === owner.id);

        if (ownersChannel) {
            owner.client.emit("warn", `${owner.displayName} created a new personal channel, while they had one already!`);
            this.removeChannel(ownersChannel.channel);
        }

        channels.set(customChannel.id, {
            channel: customChannel,
            isPrivate,
            owner,
            invitees
        });
    }

    private removeChannel(customChannel: GuildChannel) {
        const storage = DiscordBasedStorage.getInstance();
        const channels = storage.getFromGuildLevel(customChannel.guild, "customChannels.channels");
        channels.delete(customChannel.id);
        this.deleteCustomChannel(customChannel);
    }

    private addInvitee(owner: GuildMember, customChannel: GuildChannel, invitee: GuildMember) {
        const storage = DiscordBasedStorage.getInstance();
        const channels = storage.getFromGuildLevel(owner.guild, "customChannels.channels");
        const channel = channels.get(customChannel.id);

        if (channel.isPrivate) {
            channel.invitees.push(invitee);
            customChannel.overwritePermissions(this.createPrivatePermissions(channel.invitees));
        }
    }

}

