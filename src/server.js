const http = require("http");
const commando = require("discord.js-commando");
const path = require("path");
const oneLine = require("common-tags").oneLine;
const sqlite = require("sqlite");

const RestLoader = require("./services/rest-loader");
const Storage = require("./services/storage");

const restLoader = Object.create(RestLoader);

restLoader.RestLoader(process.env.PORT ? process.env.PORT : 3000);
Storage.Storage();

var herokuSleepDisabler;

const client = new commando.Client({
    owner: process.env.OWNER_ID,
    commandPrefix: ".",
    commandEditableDuration: 0,
    unknownCommandResponse: false
});

client
    .on("error", error => console.error(`[ERROR] ${error}`))
    .on("warn", warn => console.warn(`[WARN] ${warn}`))
    .on("info", info => console.log(`[INFO] ${info}`))
    .on("debug", debug => console.log(`[DEBUG] ${debug}`))
    .on("ready", () => {
        client.emit("info", `Client ready; logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
    })
    .on("disconnect", () => { client.emit("warn", "Disconnected!"); })
    .on("reconnecting", () => { client.emit("warn", "Reconnecting..."); })
    .on("commandError", (cmd, err) => {
        if(err instanceof commando.FriendlyError) return;
        client.emit("error",`Error in command ${cmd.groupID}:${cmd.memberName} - ${err}`);
    })
    .on("commandBlocked", (msg, reason) => {
        client.emit("info", oneLine`
			Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ""}
			blocked; ${reason}
		`);
    })
    .on("commandPrefixChange", (guild, prefix) => {
        client.emit("info", oneLine`
			Prefix ${prefix === "" ? "removed" : `changed to ${prefix || "the default"}`}
			${guild ? `in guild ${guild.name} (${guild.id})` : "globally"}.
		`);
    })
    .on("commandStatusChange", (guild, command, enabled) => {
        client.emit("info", oneLine`
			Command ${command.groupID}:${command.memberName}
			${enabled ? "enabled" : "disabled"}
			${guild ? `in guild ${guild.name} (${guild.id})` : "globally"}.
		`);
    })
    .on("groupStatusChange", (guild, group, enabled) => {
        client.emit("info", oneLine`
			Group ${group.id}
			${enabled ? "enabled" : "disabled"}
			${guild ? `in guild ${guild.name} (${guild.id})` : "globally"}.
		`);
    });

client.setProvider(
    sqlite.open(path.join(__dirname, "database.sqlite3")).then(db => new commando.SQLiteProvider(db))
).catch(error => client.emit("error", `Error during database provider set: ${Object.entries(error)}`));

client.registry
    //.registerGroup("alarm", "Alarm")
    .registerGroup("channel", "Private channels")
    .registerGroup("donate", "Donation")
    .registerGroup("gather", "Gather")
    .registerGroup("log", "Server log")
    .registerGroup("me", "/Me")
    .registerGroup("music", "Youtube Music Play")
    .registerGroup("poke", "Poke")
    .registerGroup("poll", "Poll")
    .registerDefaults()
    .registerTypesIn(path.join(__dirname, "types"))
    .registerCommandsIn(path.join(__dirname, "commands"));

client.login(process.env.BOT_TOKEN)
    .then(function discordBotStarted() {
        restLoader.load(client)
            .then(function endpointsLoaded() {
                restLoader.start();
            })
            .then(function restStarted() {
                if (process.env.HEROKU_ENV) {
                // Workaround for Heroku's dyno auto-sleep feature
                // If the dyno under the bot sleeps, the bot will be offline
                    herokuSleepDisabler = setInterval(function() {
                        http.get(process.env.HEROKU_ENV);
                    }, 1000 * 60 * 20); // every 20 minutes
                }
            });
    })
    .catch((err) => {
        client.emit("error", `Failure during setup: ${err}`);

        client.emit("warn", "Shutting down...");

        if (process.env.HEROKU_ENV) {
            clearInterval(herokuSleepDisabler);
        }
    });