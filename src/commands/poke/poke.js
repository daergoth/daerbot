const commando = require("discord.js-commando");
const notificationService = require("../../services/notification");

module.exports = class PokeCommand extends commando.Command {
    constructor(client) {
        super(client, {
            name: "poke",
            group: "poke",
            memberName: "poke",
            description: "Poke a user to get their attention.",
            examples: [
                "poke @someone"
            ],
            args: [
                {
                    key: "user",
                    label: "user",
                    prompt: "Tag someone to poke.",
                    type: "user"
                },
                {
                    key: "pokeMessage",
                    label: "message",
                    prompt: "What should be the message of the poke?",
                    type: "string",
                    default: ""
                }
            ],
            guildOnly: true,
            throttling: {
                duration: 10,
                usages: 1
            }
        });
    }

    run(msg, args) {
        if (msg.guild.member(args.user)) {
            notificationService.notifyUser(args.user, 5,
                ((dmChannel) => {
                    if (args.pokeMessage) {
                        dmChannel.send(`${msg.author} poked you: ${args.pokeMessage}`, {tts:true})
                            .catch(err => msg.client.emit("error", `Cannot send poke message: ${err}`));
                    }
                }))
                .then(() => 
                    msg.channel.send(`${msg.author} poked ${args.user}!`)
                        .then(msg => msg.delete(2000))
                        .catch(err => msg.client.emit("error", `Poke error: ${err}`))
                );
        }
    }
};