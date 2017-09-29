const Discord = require("discord.js");
const Router = require("./router");
const Storage = require("./storage");
const Configuration = require("./configuration");

const client = new Discord.Client();

const commandRouter = Object.create(Router);
const storage = Object.create(Storage);

Configuration.reloadConfiguration()
    .then(function configurationLoaded() {
        commandRouter.Router();
        storage.Storage();

        return commandRouter.reloadCommandModules();
    })
    .then(function commandModulesLoaded() {
        commandRouter.registerPreHandleHook(
            function disableSelfMessagePreHandleHook(handlerObject, message) {
                return message.author !== message.client.user;
            }
        );

        commandRouter.registerPreHandleHook(
            function filterTextChannelMessagePreHandleHook(handlerObject, message) {
                return message.channel.type === "text";
            }
        );

        commandRouter.registerPreHandleHook(
            function loggerPreHandleHook(handlerObject, message) {
                console.info(`${new Date(message.createdTimestamp).toISOString()} ${message.author.tag}: ${message.content}`);
                return true;
            }
        );

        commandRouter.registerPreHandleHook(
            function roleAuthorizationPreHandleHook(handlerObject, message) {
                if (handlerObject.secure) {
                    if (message.guild) {
                        return message.guild.fetchMember(message)
                            .then(guildMember => {
                                let role = guildMember.roles.find(r => r.name === Configuration.getConfig("server.adminRole", "DaerBot"));
                                if (role) {
                                    return true;
                                } else {
                                    message.channel.send("You don't have permission to use this command!");
                                    console.info("Unauthorized!");
                                    return false;
                                }
                            })
                            .catch(err => console.error(`Couldn't fetch member for message ("${message.content}"): ${err}`));
                    } else {
                        console.warn("Message has no guild, when channel is TextChannel!");
                        console.log(message.channel);
                        return false;
                    }
                } else {
                    return true;
                }
            }
        );

        commandRouter.registerPreHandleHook(
            function showWorkingIndicatorPreHandleHook(handlerObject, message) {
                message.channel.startTyping();
                return true;
            }
        );
    })
    .then(function preHandleHooksLoaded() {
        commandRouter.registerPostHandleHook(
            function hideWorkingIndicatorPostHandleHook(handlerObject, message) {
                message.channel.stopTyping(true);
                return true;
            }
        );
    })
    .then(function postHandleHooksLoaded() {
        client.on("ready", () => console.log("I am ready!"));

        client.on("message", function handleMessage(message) {
            const handlerObject = commandRouter.route(message);

            if (handlerObject) {
                if (!commandRouter.runPreHandleHooks(handlerObject, message)) {
                    return;
                }
    
                handlerObject.handle(message, storage);
    
                commandRouter.runPostHandleHooks(handlerObject, message);
            }
        });

        client.login(process.env.BOT_TOKEN);
    })
    .catch(function failure(err) {
        console.log("Failure during setup:", err);

        console.log("Shutting down...");
    });

