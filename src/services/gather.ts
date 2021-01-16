import { DiscordBasedStorage } from "./storage";
import { gather } from "../custom-gather-config.json";
import { Message, MessageCollector, MessageEmbed, TextChannel, User } from "discord.js";

const gatherPlusMentionRegex = /^(<@(!)?\d+>\s*)*\+/;

interface GatherObject {
    thumbnail: string;
    title: string;
}

export class GatherHelperService {

    private static instance: GatherHelperService;

    private constructor() {}

    public static getInstance() {
        if (!this.instance) {
            this.instance = new GatherHelperService();
        }
        return this.instance;
    }

    public sendGatherStatus(channel: TextChannel) {
        const storage = DiscordBasedStorage.getInstance();
        const currentEmbed = storage.getFromChannelLevel(channel, "gather.currentEmbed");

        if (currentEmbed) {
            return channel.send(currentEmbed)
                .then(msg => {
                    const gatherMessages = storage.getFromChannelLevel(channel, "gather.gatherMessages", true, []);
                    gatherMessages.push(msg);

                    storage.saveOnChannelLevel(channel, "gather", {
                        gatherMessages
                    });

                    return msg;
                });
        } else {
            channel.client.emit("warn", "Cannot send Gather status: no Embed saved in storage!");
        }
    }

    private createGatherEmbed(author: User, channel: TextChannel, title: string) {
        const storage = DiscordBasedStorage.getInstance()
        const currentEmbed = new MessageEmbed()
            .setAuthor(author.username, author.displayAvatarURL())
            .setDescription("Type '+' to join this gathering!")
            .setColor([255, 0, 0]);

        const customGameKeyword = storage.getFromChannelLevel(channel, "gather.customGame");
        const customGameObject = gather[customGameKeyword] as GatherObject;
        if (customGameObject) {
            currentEmbed.setTitle(customGameObject.title);
            currentEmbed.setThumbnail(customGameObject.thumbnail);
        }

        if (title && title.length > 1) {
            currentEmbed.setTitle(title);
        }

        storage.saveOnChannelLevel(channel, "gather", {
            currentEmbed
        });

        return currentEmbed;
    }

    public startGather(message: Message, title: string) {
        const storage = DiscordBasedStorage.getInstance();
        const listener = this.joinListener.bind(this);

        const messageCollector = message.channel.createMessageCollector(this.joinFilter, {
            time: 1000 * 60 * 15 // 15 min timeout to auto-stop gathering
        });

        messageCollector.on("collect", listener);
        messageCollector.on("end", () => this.clearGathering(message.channel as TextChannel));

        storage.saveOnChannelLevel(message.channel as TextChannel, "gather", {
            starterMessage: message,
            isGathering: true,
            collector: messageCollector
        });

        this.createGatherEmbed(message.author, message.channel as TextChannel, title);

        return this.sendGatherStatus(message.channel as TextChannel);
    }

    public clearGathering(channel: TextChannel) {
        const storage = DiscordBasedStorage.getInstance();
        if (!storage.getFromChannelLevel(channel, "gather.isGathering")) {
            return;
        }

        const collector = storage.getFromChannelLevel(channel, "gather.collector") as MessageCollector;
        collector.removeAllListeners("end")
        collector.stop();

        const currentEmbed = storage.getFromChannelLevel(channel, "gather.currentEmbed") as MessageEmbed;
        currentEmbed.setFooter("ENDED!");
        currentEmbed.setDescription("");

        const gatherMessages = storage.getFromChannelLevel(channel, "gather.gatherMessages") as Message[];
        gatherMessages.forEach(msg => msg.edit(currentEmbed));

        storage.saveOnChannelLevel(channel, "gather", {
            starterMessage: undefined,
            currentEmbed: undefined,
            playerList: [],
            gatherMessages: [],
            customGame: "",
            isGathering: false
        });

        return channel.send(currentEmbed);
    }

    private joinFilter(message: Message): boolean {
        return gatherPlusMentionRegex.test(message.content);
    }

    private joinListener(message: Message) {
        const storage = DiscordBasedStorage.getInstance();
        const channel = message.channel as TextChannel;
        const playerList = storage.getFromChannelLevel(channel, "gather.playerList", true, []) as User[];
        const currentEmbed = storage.getFromChannelLevel(channel, "gather.currentEmbed") as MessageEmbed;
        const gatherMessages = storage.getFromChannelLevel(channel, "gather.gatherMessages", true, []) as Message[];

        const joiningUsers = [];

        let joinType: string;
        if (message.mentions.members.size > 0) {
            joiningUsers.push(...message.mentions.members.array());
            joinType = "other";
        } else {
            joiningUsers.push(message.member);
            joinType = "own"
        }

        message.client.emit("debug", `Gather join: type=${joinType} author="${message.author.tag}" content="${message.content}" cleanContent="${message.cleanContent}"`);

        const note = message.content.split("+").slice(1).join("+");

        joiningUsers.forEach(joiningUser => {
            const idChecker = this.userIdCheck.bind(this, joiningUser);

            if (!playerList.some(idChecker) && !note.includes(`${joiningUser}`)) {
                playerList.push(joiningUser);

                const field = `${playerList.length} - ${joiningUser}${note ? `: ${note}` : ""}`;
                currentEmbed.addField("\u200B", field);

                gatherMessages.forEach(msg => {
                    if (msg.editable) {
                        msg.edit(currentEmbed)
                            .catch(error => message.client.emit("warn", `Cannot edit gather status message: ${error}`));
                    }
                })

                if (message.deletable) {
                    message.delete({timeout: 2000})
                        .catch(error => message.client.emit("warn", `Cannot delete gather join message: ${error}`));
                }
            }
        });
    }

    private userIdCheck(user1: User, user2: User): boolean {
        return user1.id === user2.id;
    }

}