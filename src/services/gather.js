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

        function idCheck(user1, user2) {
            return user1.id === user2.id;
        }

        let starterMessage = storage.getFromChannelLevel(message.channel, "gather.starterMessage");
        let playerList = storage.getFromChannelLevel(message.channel, "gather.playerList", true, []);
        let currentRichEmbed = storage.getFromChannelLevel(message.channel, "gather.currentRichEmbed");
        let gatherMessages = storage.getFromChannelLevel(message.channel, "gather.gatherMessages", true, []);
    
        if (starterMessage && message.channel.id === starterMessage.channel.id) {
            let joiningUsers = [];
            let regexp = /^(<@(!)?\d+>\s*)+\+/;

            let joinType = undefined;
            if (message.cleanContent.startsWith("+")) {
                joiningUsers = joiningUsers.concat(message.member);
                joinType = "own";
            } else if (message.mentions.members && regexp.test(message.content)) {
                joiningUsers = joiningUsers.concat(message.mentions.members.array());
                joinType = "other";
            } else {
                return;
            }
            message.client.emit("debug", `Gather join: type=${joinType} author="${message.author.tag}" content="${message.content}" cleanContent="${message.cleanContent}"`);
            
            let note = message.content.split("+").slice(1).join("+");

            for (let i = 0; i < joiningUsers.length; ++i) {
                let joiningUser = joiningUsers[i];
                if (!playerList.some(idCheck.bind(this, joiningUser)) 
                        && !note.includes(`${joiningUser}`)) {
                    playerList.push(joiningUser);
        
                    let m = `${playerList.length} - ${joiningUser}`;
                    if (note) {
                        m += `: ${note}`;
                    }
        
                    currentRichEmbed.addField("\u200B", m);
        
                    gatherMessages.forEach(gM => {
                        if (gM.editable) {
                            gM.edit(currentRichEmbed)
                                .catch(error => message.client.emit("warn", `Cannot edit gather status message: ${error}`));
                        }
                    });
        
                    if (message.deletable) {
                        message.delete(2000)
                            .catch(error => message.client.emit("warn", `Cannot delete gather join message: ${error}`));
                    }
                }
            }
        }
    }

};

module.exports = GatherHelperService;