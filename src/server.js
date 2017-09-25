const Discord = require("discord.js");
const Router = require("./router");
const Configuration = require("./configuration");

const client = new Discord.Client();

const commandRouter = Object.create(Router);

Configuration.reloadConfiguration()
    .then(function configurationLoaded() {
        commandRouter.Router();

        return commandRouter.reloadCommandModules();
    })
    .then(function commandModulesLoaded() {
        client.on("ready", () => console.log("I am ready!"));

        client.on("message", function handleMessage(message) {
            const handler = commandRouter.route(message);

            handler(client);
        });

        client.login(process.env.BOT_TOKEN);
    })
    .catch(function failure(err) {
        console.log("Failure during setup:", err);

        console.log("Shutting down...");
    });

