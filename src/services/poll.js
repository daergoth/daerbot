const Discord = require("discord.js");

const util = require("./util");
const storage = require("./storage");

const customGatherStorage = require("../custom-gather-config.json");
const CSGO_ICON_URL = customGatherStorage.gather.csgo.thumbnail ||
    "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/apps/730/d0595ff02f5c79fd19b06f4d6165c3fda2372820.jpg";

const PollHelperService = {
    generatePollEmbed(channel) {
        let poll = storage.getFromChannelLevel(channel, "poll");
    
        if (poll && poll.voteCollector) {
            let sumVotes = poll.votes.reduce((prev, curr) => prev + curr, 0);
    
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
                .setTitle("**POLL: " + poll.question + "**")
                .setDescription(description)
                .setFooter(sumVotes + " total votes cast.")
                .setColor([0, 0, 255]);
    
            if (storage.getFromChannelLevel(channel, "poll.isCSGO", true, false)) {
                embed.setThumbnail(CSGO_ICON_URL);
            }
    
            return embed;
        }
    },

    clearPoll(channel) {
        let poll = storage.getFromChannelLevel(channel, "poll");
    
        if (poll && poll.voteCollector) {
            poll.voteCollector.stop();
    
            let embed = this.generatePollEmbed(channel);
            embed.setTitle("**CLOSED:** " + poll.question);
    
            storage.saveOnChannelLevel(channel, "poll", {
                author: undefined,
                question: "",
                voters: [],
                options: [],
                voteCollector: undefined,
                votes: [],
                isCSGO: false
            });
            
            return channel.send(embed);
        } 
    },

    isRunningPoll(channel) {
        return storage.getFromChannelLevel(channel, "poll") != undefined;
    },

    startPoll(message, pollText) {
        let params = util.sanatizeCommandInput(pollText.split(";"))
            .filter((p, index, self) => {
                return self.indexOf(p) == index;
            });

        if (params.length >= 3) {
            let vC = storage.getFromChannelLevel(message.channel, "poll.voteCollector");

            if (vC) {
                return message.reply("Poll already exists, end it before starting a new!");
            }

            let question = params[0];
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
            
            let voteCollector = this._createVoteCollector(message.channel);
            
            storage.saveOnChannelLevel(message.channel, "poll", {
                author: {
                    username: message.author.username,
                    avatarURL: message.author.avatarURL
                },
                question,
                voters: [],
                options,
                voteCollector,
                votes: Array(options.length).fill(0),
            });
            
            return message.channel.send(embed);
        } else {
            return message.reply("Invalid poll format! Example: .poll Question?;Option 1;Option 2");
        }
    },

    _createVoteCollector(channel) {
        let voteCollector = new Discord.MessageCollector(channel,
            this._pollFilter.bind(this, storage));

        voteCollector.on("collect", this._pollCollect.bind(this, storage));

        return voteCollector;
    },

    _pollFilter(storage, message) {
        let options = storage.getFromChannelLevel(message.channel, "poll.options");
        let voters = storage.getFromChannelLevel(message.channel, "poll.voters", true, []);
    
        return !voters.includes(message.author) && (options.includes(message.content) || (parseInt(message.content) > 0 && parseInt(message.content) <= options.length));
    },

    _pollCollect(storage, message) {
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
};

module.exports = PollHelperService;