const Discord = require("discord.js");
const storage = require("./storage");

const customGatherCommandStorage = require("../custom-gather-config.json");

const GatherHelperService = {

    sendGatherStatus(channel) {
        let currentRichEmbed = storage.getFromChannelLevel(channel, "gather.currentRichEmbed");
        
        if (currentRichEmbed) {
            return channel.send(currentRichEmbed)
                .then(m => {
                    let gatherMessages = storage.getFromChannelLevel(channel, "gather.gatherMessages", true, []);
                    gatherMessages.push(m);
                    storage.saveOnChannelLevel(channel, "gather", {
                        gatherMessages: gatherMessages
                    });
                });
        } else {
            channel.client.emit("warn", "Cannot send Gather status: no RichEmbed saved in Storage!");
        }
    },

    createGatherRichEmbed(author, channel, title) {
        let currentRichEmbed = new Discord.RichEmbed()
            .setAuthor(author.username, author.avatarURL)
            .setDescription("Type '+' to join this gathering!")
            .setColor([255, 0, 0]);

        let customGameKeyword = storage.getFromChannelLevel(channel, "gather.customGame");
        let customGameObject = customGatherCommandStorage.gather[customGameKeyword];
        if (customGameObject != undefined) {
            currentRichEmbed.setTitle(customGameObject.title);
            currentRichEmbed.setThumbnail(customGameObject.thumbnail);
        }

        if (title && title.length > 1) {
            currentRichEmbed.setTitle(title);
        }

        storage.saveOnChannelLevel(channel, "gather", {
            currentRichEmbed: currentRichEmbed
        });

        return currentRichEmbed;
    },

    startGather(message, title) {
        let listener = this._joinListener.bind(this, storage);

        storage.saveOnChannelLevel(message.channel, "gather", {
            starterMessage: message,
            isGathering: true,
            // 15 min timeout to auto-stop gathering
            endTimeout: setTimeout(this.clearGathering, 1000 * 60 * 15, message.channel, message.client),
            joinListener: listener
        });
        
        this.createGatherRichEmbed(
            {
                username: message.author.username,
                avatarURL: message.author.displayAvatarURL
            },
            message.channel,
            title
        );

        message.client.on("message", listener);
        
        return this.sendGatherStatus(message.channel);
    },

    clearGathering(channel, client) {
        if (!storage.getFromChannelLevel(channel, "gather.isGathering")) {
            return;
        }
    
        client.removeListener("message", storage.getFromChannelLevel(channel, "gather.joinListener"));
    
        if (storage.getFromChannelLevel(channel, "gather.endTimeout")) {
            clearTimeout(storage.getFromChannelLevel(channel, "gather.endTimeout"));
        }
    
        let currentRichEmbed = storage.getFromChannelLevel(channel, "gather.currentRichEmbed");
    
        currentRichEmbed.setFooter("ENDED!");
        currentRichEmbed.setDescription("");
        
        storage.getFromChannelLevel(channel, "gather.gatherMessages")
            .forEach(gM => gM.edit(currentRichEmbed));

        storage.saveOnChannelLevel(channel, "gather", {
            starterMessage: undefined,
            currentRichEmbed: undefined,
            endTimeout: undefined,
            playerList: [],
            gatherMessages: [],
            customGame: "",
            isGathering: false
        });

        return channel.send(currentRichEmbed);
    },

    _joinListener (storage, message) {
        let starterMessage = storage.getFromChannelLevel(message.channel, "gather.starterMessage");
        let playerList = storage.getFromChannelLevel(message.channel, "gather.playerList", true, []);
        let currentRichEmbed = storage.getFromChannelLevel(message.channel, "gather.currentRichEmbed");
        let gatherMessages = storage.getFromChannelLevel(message.channel, "gather.gatherMessages", true, []);
    
        if (starterMessage && message.channel === starterMessage.channel) {
            let joiningUsers = [];
            let regexp = /^(<@\d+>\s*)+\+/i;
            if (message.cleanContent.startsWith("+")) {
                joiningUsers = joiningUsers.concat(message.author);
            } else if (message.mentions.members && regexp.test(message.content)) {
                joiningUsers = joiningUsers.concat(message.mentions.members.array());
            }

            for (let i = 0; i < joiningUsers.length; ++i) {
                let joiningUser = joiningUsers[i];
                if (!playerList.includes(joiningUser)) {
                    playerList.push(joiningUser);
        
                    let note = message.content.split("+").slice(1).join("+");
        
                    let m = `${playerList.length} - ${joiningUser}`;
                    if (note) {
                        m += `: ${note}`;
                    }
        
                    currentRichEmbed.addField("\u200B", m);
        
                    gatherMessages.forEach(gM => gM.edit(currentRichEmbed));
        
                    message.delete(2000);
                }
            }
        }
    }

};

module.exports = GatherHelperService;