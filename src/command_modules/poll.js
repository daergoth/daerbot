const Discord = require("discord.js");
const ContentRegExpHandler = require("../content-regexp-handler");

function pollFilter(storage, message) {
    let options = storage.getFromChannelLevel(message.channel, "poll.options");
    let voters = storage.getFromChannelLevel(message.channel, "poll.voters", true, []);

    return !voters.includes(message.author) && (options.includes(message.content) || (parseInt(message.content) > 0 && parseInt(message.content) <= options.length));
}

function pollCollect(storage, message) {
    message.delete()
        .then(m => {
            m.channel.send(m.author + " voted!");
        });

    let poll = storage.getFromChannelLevel(message.channel, "poll");

    let voteIndex = -1;

    if (poll.options.includes(message.content)) {
        voteIndex = poll.options.indexOf(message.content);
    } else {
        voteIndex = parseInt(message.content) - 1;
    }

    poll.votes[voteIndex]++;

    poll.voters.push(message.author);

    storage.saveOnChannelLevel(message.channel, "poll", {
        votes: poll.votes,
        voters: poll.voters
    });
}

function generatePollEmbed(channel, storage) {
    let poll = storage.getFromChannelLevel(channel, "poll");

    if (poll && poll.voteCollector) {
        let sumVotes = poll.votes.reduce((prev, curr) => prev + curr);

        poll.options.sort((a, b) => {
            return poll.votes[poll.options.indexOf(b)] - poll.votes[poll.options.indexOf(b)];
        });
        poll.votes.sort((a, b) => {
            return b - a;
        });

        let description = "";
        if (sumVotes >= 1) {
            poll.options.forEach((option, index) => {
                description += (index + 1) + ". **" + option + "** with **" + poll.votes[index] + "** votes\n";
            });
        } else {
            description = "No votes cast!";
        }

        let embed = new Discord.RichEmbed()
            .setAuthor(poll.author.username, poll.author.avatarURL)
            .setTitle("**" + poll.question + "**")
            .setDescription(description)
            .setFooter(sumVotes + " total votes cast.")
            .setColor([0, 0, 255]);
        return embed;
    }

}

const PollEndHandler = {
    PollEndHandler() {
        this.ContentRegExpHandler(/^\.pollend/);
    },
    handle(message, storage) {
        let poll = storage.getFromChannelLevel(message.channel, "poll");

        if (poll && poll.voteCollector) {
            poll.voteCollector.stop();

            let embed = generatePollEmbed(message.channel, storage);
            embed.setTitle("**CLOSED:** " + embed.title);

            message.channel.send(embed);

            storage.saveOnChannelLevel(message.channel, "poll", {
                author: undefined,
                question: "",
                voters: [],
                options: [],
                voteCollector: undefined,
                votes: [],
            });
        } else {
            message.channel.send("There is no poll to end!");
        }
    }
};

Object.setPrototypeOf(PollEndHandler, ContentRegExpHandler);

const PollStatHandler = {
    PollStatHandler() {
        this.ContentRegExpHandler(/^\.pollstats/);
    },
    handle(message, storage) {
        let embed = generatePollEmbed(message.channel, storage);

        message.channel.send(embed);
    }
};

Object.setPrototypeOf(PollStatHandler, ContentRegExpHandler);

const PollHandler = {
    PollHandler() {
        this.ContentRegExpHandler(/^\.poll/);
    },
    handle(message, storage) {
        let params = message.content.split(";");

        if (params.length >= 3) {
            let vC = storage.getFromChannelLevel(message.channel, "poll.voteCollector");

            if (vC) {
                message.channel.send("Poll already exists, end it before starting a new!");
                return;
            }

            let question = params[0].split(" ").slice(1).join(" ");
            let options = params.slice(1);

            let description = "*To participate send a message with "
                + "the **number** or the **content** of the answer.*\n";
            options.forEach(function (option, index) {
                description += "**" + (index + 1) + "** - **" + option + "**\n";
            });

            let embed = new Discord.RichEmbed()
                .setAuthor(message.author.username, message.author.avatarURL)
                .setTitle("**POLL: " + question + "**")
                .setDescription(description)
                .setColor([0, 0, 255]);

            message.channel.send(embed);

            let voteCollector = new Discord.MessageCollector(message.channel,
                pollFilter.bind(this, storage));

            storage.saveOnChannelLevel(message.channel, "poll", {
                author: message.author,
                question,
                voters: [],
                options,
                voteCollector,
                votes: Array(options.length).fill(0),
            });

            voteCollector.on("collect", pollCollect.bind(this, storage));

        } else {
            message.channel.send("Invalid poll format! Example: .poll Question?;Option 1;Option 2;Option 3");
        }
    }
};

Object.setPrototypeOf(PollHandler, ContentRegExpHandler);

function registerHandlers(registerFunction) {
    const pollEndHandler = Object.create(PollEndHandler);
    pollEndHandler.PollEndHandler();

    const pollHandler = Object.create(PollHandler);
    pollHandler.PollHandler();

    const pollStatHandler = Object.create(PollStatHandler);
    pollStatHandler.PollStatHandler();

    registerFunction(pollEndHandler);
    registerFunction(pollHandler);
    registerFunction(pollStatHandler);
}

module.exports = {
    registerHandlers
};