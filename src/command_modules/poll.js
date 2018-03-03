const Discord = require("discord.js");
const util = require("../util");
const configuration = require("../configuration");
const PrefixedContentRegExpHandler = require("../matchers/prefixed-content-regexp-handler");

const CSGO_ICON_URL = configuration.getConfig("gather.csgo.thumbnail",
    "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/730/d0595ff02f5c79fd19b06f4d6165c3fda2372820.jpg");

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

    if (/^[\d]+$/.test(message.content)) {
        voteIndex = parseInt(message.content) - 1;
    } else {
        voteIndex = poll.options.indexOf(message.content);
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

        let result = [];
        for (let i = 0; i < poll.options.length; ++i) {
            result.push({
                option: poll.options[i],
                votes: poll.votes[i]
            });
        }
        result.sort((a, b) => {
            return b.votes - a.votes;
        });

        let description = "";
        if (sumVotes >= 1) {
            result.forEach((r) => {
                description += "**" + (poll.options.indexOf(r.option) + 1) + "** - **" + r.option + "** with **" + r.votes + "** votes\n";
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

        if (storage.getFromChannelLevel(channel, "poll.isCSGO", true, false)) {
            embed.setThumbnail(CSGO_ICON_URL);
        }

        return embed;
    }

}

const PollEndHandler = {
    PollEndHandler() {
        this.PrefixedContentRegExpHandler(/pollend/);
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
                isCSGO: false
            });
        } else {
            message.channel.send("There is no poll to end!");
        }
    }
};

Object.setPrototypeOf(PollEndHandler, PrefixedContentRegExpHandler);

const PollStatHandler = {
    PollStatHandler() {
        this.PrefixedContentRegExpHandler(/pollstat/);
    },
    handle(message, storage) {
        let embed = generatePollEmbed(message.channel, storage);

        if (embed) {
            message.channel.send(embed);
        } else {
            message.channel.send("There is no active poll right now!");
        }
    }
};

Object.setPrototypeOf(PollStatHandler, PrefixedContentRegExpHandler);

const PollHandler = {
    PollHandler() {
        this.PrefixedContentRegExpHandler(/poll/);
    },
    handle(message, storage) {
        let params = util.sanatizeCommandInput(message.content.split(";"))
            .filter((p, index, self) => {
                return self.indexOf(p) == index;
            });

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

            if (storage.getFromChannelLevel(message.channel, "poll.isCSGO", true, false)) {
                embed.setThumbnail(CSGO_ICON_URL);
            }

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

Object.setPrototypeOf(PollHandler, PrefixedContentRegExpHandler);

const MapPollHandler = {
    MapPollHandler() {
        this.PrefixedContentRegExpHandler(/csgomap\?/);
    },
    handle(message, storage) {
        message.content = ".poll Which map?;Dust 2;Inferno;Mirage;Cache;Cobblestone;Overpass;Train;Nuke";

        storage.saveOnChannelLevel(message.channel, "poll", {
            isCSGO: true
        });

        PollHandler.handle(message, storage);
    }
};

Object.setPrototypeOf(MapPollHandler, PrefixedContentRegExpHandler);

function registerHandlers(registerFunction) {
    const pollEndHandler = Object.create(PollEndHandler);
    pollEndHandler.PollEndHandler();

    const pollStatHandler = Object.create(PollStatHandler);
    pollStatHandler.PollStatHandler();

    const pollHandler = Object.create(PollHandler);
    pollHandler.PollHandler();

    const mapPollHandler = Object.create(MapPollHandler);
    mapPollHandler.MapPollHandler();

    registerFunction(pollEndHandler);
    registerFunction(pollStatHandler);
    registerFunction(pollHandler);
    registerFunction(mapPollHandler);
}

module.exports = {
    registerHandlers
};