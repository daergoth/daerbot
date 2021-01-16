import { MessageEmbed } from "discord.js";
import { Command, CommandoMessage } from "discord.js-commando";

module.exports = class DonateCommand extends Command {
    constructor(client) {
        super(client, {
            name: "donate",
            group: "donate",
            memberName: "donate",
            description: "Donate to given user.",
            examples: ["donate @person Surprise!"],
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

    private getFakeCurrencies() {
        return ["gold coins", "credits", "bottle caps", "souls", "nickels", "space bucks", "Monopoly Dollar", "galleons", "Simoleons"]
    }

    public run(message: CommandoMessage, args) {
        const author = {
            username: message.author.username,
            avatarURL: message.author.displayAvatarURL()
        }

        const randomAmount = Math.floor(Math.random() * 49) + 2
        const randomCurrency = Math.floor(Math.random() * this.getFakeCurrencies().length)

        const currentRichEmbed = new MessageEmbed()
            .setAuthor(author.username, author.avatarURL)
            .setTitle(`Donated ${randomAmount} ${this.getFakeCurrencies()[randomCurrency]} to ${args.user.username}`)
            .setThumbnail("https://image.shutterstock.com/image-vector/money-vector-icon-bank-note-260nw-1035443560.jpg")
            .setDescription(args.note)
            .setColor([0, 100, 0]);

        return message.channel.send(currentRichEmbed);
    }

};
