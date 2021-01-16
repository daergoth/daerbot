import { DMChannel } from "discord.js";
import { Command, CommandoClient, CommandoMessage } from "discord.js-commando";
import { NotificationService, BeforeNotifyFunction } from "../../services/notification";

module.exports = class PokeCommand extends Command {
    constructor(client: CommandoClient) {
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

    public run(message: CommandoMessage, args) {
        const service = NotificationService.getInstance();

        if (message.guild.member(args.user)) {
            const beforeMethod: BeforeNotifyFunction = (dmChannel: DMChannel) => {
                if (args.pokeMessage) {
                    dmChannel.send(`${message.author} poked you: ${args.pokeMessage}`, {tts:true})
                        .catch((err: any) => message.client.emit("error", new Error(`Cannot send poke message: ${err}`)));
                }
            }

            const pokeMsg = service.notifyUser(args.user, 5, "Poke", beforeMethod)
                .then(() => message.channel.send(`${message.author} poked ${args.user}!`))
                .then(m => {
                    message.delete({timeout: 2000});
                    return m;
                });

            pokeMsg.catch((err) => message.client.emit("error", new Error(`Poke error: ${err}`)));

            return pokeMsg;
        }
    }
};