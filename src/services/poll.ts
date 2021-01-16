import { Message, MessageEmbed, TextChannel } from "discord.js";
import { DiscordBasedStorage } from "./storage";

export class PollHelperService {
    private static instance: PollHelperService;

    private constructor() {}

    public static getInstance() {
        if(!this.instance) {
            this.instance = new PollHelperService();
        }
        return this.instance;
    }

    public startPoll(message: Message, pollString: string) {
        const storage = DiscordBasedStorage.getInstance();
        const channel = message.channel as TextChannel;

        const params = this.sanitizePollInput(pollString.split(";"))
            .filter((param, index, self) => self.indexOf(param) === index);

        if (params.length >= 3) {
            let voteCollector = storage.getFromChannelLevel(channel, "poll.voteCollector");

            if (voteCollector)
                return message.reply("Poll already exists, end it before starting a new!");

            const question = params[0];
            const options = params.slice(1);

            const embed = new MessageEmbed()
                .setAuthor(message.author.username, message.author.displayAvatarURL())
                .setTitle(`Poll: **${question}**`)
                .setDescription("*To participate send a message with the **number** or the **content** of the answer.*")
                .setColor([0, 0, 255]);

            options.forEach((option, index) => embed.addField(`Option ${index + 1}:`, option, false));

            voteCollector = this.createVoteCollector(channel);

            storage.saveOnChannelLevel(channel, "poll", {
                authorUsername: message.author.username,
                authorAvatarURL: message.author.displayAvatarURL(),
                question,
                voters: [],
                options,
                voteCollector,
                votes: Array(options.length).fill(0),
            });

            return channel.send(embed);
        } else {
            return message.reply("Invalid poll format! Example: .poll Question?;Option 1;Option 2");
        }
    }

    public clearPoll(message: Message) {
        const storage = DiscordBasedStorage.getInstance();
        const channel = message.channel as TextChannel;

        const poll = storage.getFromChannelLevel(channel, "poll");

        if (poll && poll.voteCollector) {
            poll.voteCollector.stop();

            const embed = this.generatePollEmbed(message);
            embed.setTitle("Closed: **" + poll.question + "**");

            storage.saveOnChannelLevel(channel, "poll", {
                authorUsername: "",
                authorAvatarURL: "",
                question: "",
                voters: [],
                options: [],
                voteCollector: undefined,
                votes: []
            });

            return channel.send(embed);
        }
    }

    public generatePollEmbed(message: Message) {
        const storage = DiscordBasedStorage.getInstance();
        const channel = message.channel as TextChannel;

        const poll = storage.getFromChannelLevel(channel, "poll");

        if (poll && poll.voteCollector) {
            const sumVotes = poll.votes.reduce((prev, curr) => prev + curr, 0);

            const result = [];
            for (let i = 0; i < poll.options.length; ++i) {
                result.push({
                    option: poll.options[i],
                    votes: poll.votes[i]
                });
            }
            result.sort((a, b) => {
                return b.votes - a.votes;
            });

            const embed = new MessageEmbed()
                .setAuthor(poll.authorUsername, poll.authorAvatarURL)
                .setTitle("Poll: **" + poll.question + "**")
                .setDescription("Here are the results:")
                .setFooter(sumVotes + " total votes cast.")
                .setColor([0, 0, 255]);

            embed.addField(`${result[0].option}: ${result[0].votes} vote(s)`, "\u200B", false);
            result.slice(1).forEach((r) => embed.addField("\u200B", `${r.option}: ${r.votes} vote(s)`, false));

            return embed;
        }
    }

    public isRunningPoll(message: Message): boolean {
        const storage = DiscordBasedStorage.getInstance();
        return storage.getFromChannelLevel(message.channel as TextChannel, "poll") !== undefined;
    }

    private createVoteCollector(channel: TextChannel) {
        const voteCollector = channel.createMessageCollector(this.pollFilter);
        voteCollector.on("collect", this.pollCollect);
        return voteCollector;
    }

    private pollFilter(message: Message): boolean {
        const storage = DiscordBasedStorage.getInstance();
        const channel = message.channel as TextChannel;
        const options = storage.getFromChannelLevel(channel, "poll.options").map(option => option.toLocaleLowerCase());
        const voters = storage.getFromChannelLevel(channel, "poll.voters", true, []);

        return !voters.includes(message.author) &&
            (options.includes(message.content.toLocaleLowerCase()) || (parseInt(message.content, 10) > 0 && parseInt(message.content, 10) <= options.length));
    }

    private pollCollect(message: Message) {
        const storage = DiscordBasedStorage.getInstance();
        const channel = message.channel as TextChannel;

        message.delete()
            .then(m => {
                m.channel.send(`${m.author} voted!`);
            });

        const poll = storage.getFromChannelLevel(channel, "poll");

        let voteIndex = -1;

        if (/^[\d]+$/.test(message.content)) {
            voteIndex = parseInt(message.content, 10) - 1;
        } else {
            const lowerCaseOptions = poll.options.map(option => option.toLocaleLowerCase());
            voteIndex = lowerCaseOptions.indexOf(message.content.toLocaleLowerCase());
        }

        poll.votes[voteIndex]++;

        poll.voters.push(message.author);

        storage.saveOnChannelLevel(channel, "poll", {
            votes: poll.votes,
            voters: poll.voters
        });
    }

    private sanitizePollInput(parameterArray: string[]): string[] {
        return parameterArray
            .map((p) => {
                return p.trim();
            })
            .filter((p) => {
                return p.length > 0;
            });
    }
}
