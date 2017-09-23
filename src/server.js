const Discord = require("discord.js");
const router = require("./commandRouter");

const client = new Discord.Client();

client.on("ready", () => {
    console.log("I am ready!");
});

client.on("message", message => {
    router.handleIncomingMessage(message, client);
});

client.login(process.env.BOT_TOKEN);
