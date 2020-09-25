const commando = require("discord.js-commando");
const Discord = require("discord.js");

module.exports = class DonateCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: "donate",
            group: "donate",
            memberName: "donate",
            description: "Donate to given user.",
            examples: ["donate @person $5"],
            args: [
                {
                    key: "user",
                    label: "user",
                    prompt: "Tag someone to donate.",
                    type: "user"
                },
                {
                    key: "note",
                    label: "personal_note",
                    prompt: "Personal note.",
                    type: "string",
                    default: ""
                }
            ],
            guildOnly: true
        });
    }

    getFakeCurrencies() {
        return ["gold coins", "credits", "bottle caps", "souls", "nickels", "space bucks", "Monopoly Dollar", "galleons", "Simoleons"]
    }

    run(msg, args) {
        let author = {
            username: msg.author.username,
            avatarURL: msg.author.displayAvatarURL
        }

        let randomAmount = Math.floor(Math.random() * 49) + 2
        let randomCurrency = Math.floor(Math.random() * this.getFakeCurrencies().length)

        let currentRichEmbed = new Discord.RichEmbed()
            .setAuthor(author.username, author.avatarURL)
            .setTitle(`Donated ${randomAmount} ${this.getFakeCurrencies()[randomCurrency]} to ${args.user.username}`)
            .setThumbnail("https://image.shutterstock.com/image-vector/money-vector-icon-bank-note-260nw-1035443560.jpg")
            .setDescription(args.note)
            .setColor([0, 100, 0]);

        msg.channel.send(currentRichEmbed);
    }
    
};
