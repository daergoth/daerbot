import { Client, FriendlyError, SQLiteProvider } from "discord.js-commando";
import { open } from "sqlite";
import { join } from "path";
import { get } from "http";
import { WebEndpointLoader } from "./services/web-loader";

let herokuSleepDisabler;

const webLoader = new WebEndpointLoader(
  join(__dirname, "endpoints/*/"),
  process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);

const client = new Client({
  owner: process.env.ONWER_ID,
  commandPrefix: ".",
  commandEditableDuration: 0
});

client
  .on("error", error => console.error(`[ERROR] ${error}`))
  .on("warn", warn => console.warn(`[WARN] ${warn}`))
  .on("debug", debug => console.log(`[DEBUG] ${debug}`))
  .on("ready", () => {
    client.emit("warn", `Client ready; logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
  })
  .on("shardDisconnect", () => { client.emit("warn", "Disconnected!"); })
  .on("shardReconnecting", () => { client.emit("warn", "Reconnecting..."); })
  .on("commandError", (command, error, msg, args, fromPattern) => {
    if(error instanceof FriendlyError) return;
    client.emit("error", new Error(`Error in command ${command.groupID}:${command.memberName} - ${error}`));
  })
  .on("commandBlock", (msg, reason) => {
    client.emit("warn", ` Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ""} blocked; ${reason}`);
  })
  .on("commandPrefixChange", (guild, prefix) => {
      client.emit("warn", `Prefix ${prefix === "" ? "removed" : `changed to ${prefix || "the default"}`} ${guild ? `in guild ${guild.name} (${guild.id})` : "globally"}.`);
  })
  .on("commandStatusChange", (guild, command, enabled) => {
      client.emit("warn", `Command ${command.groupID}:${command.memberName} ${enabled ? "enabled" : "disabled"} ${guild ? `in guild ${guild.name} (${guild.id})` : "globally"}.`);
  })
  .on("groupStatusChange", (guild, group, enabled) => {
      client.emit("warn", `Group ${group.id} ${enabled ? "enabled" : "disabled"} ${guild ? `in guild ${guild.name} (${guild.id})` : "globally"}.`);
  });

client.setProvider(
  open(join(__dirname, "database.sqlite"))
    .then(db => new SQLiteProvider(db))
).catch(error => client.emit("error", new Error(`Error during database provider set: ${Object.entries(error)}`)));

client.registry
  .registerGroup("channel", "Private channels")
  .registerGroup("donate", "Fake donation")
  .registerGroup("gather", "Game gathering")
  .registerGroup("log", "Server log")
  .registerGroup("me", "/Me")
  .registerGroup("music", "Youtube Music Play")
  .registerGroup("poke", "Poke")
  .registerGroup("poll", "Polls")
  .registerDefaults()
  .registerCommandsIn(join(__dirname, "commands/"));

client.login(process.env.BOT_TOKEN)
  .then(() => {
    if (process.env.HEROKU_ENV) {
      // Workaround for Heroku's dyno auto-sleep feature
      // If the dyno under the bot sleeps, the bot will be offline
      herokuSleepDisabler = setInterval(() => get(process.env.HEROKU_ENV), 1000 * 60 * 20); // every 20 minutes
    }
  })
  .then(() => {
    return webLoader.load(client);
  })
  .then(() => {
    webLoader.start();
  })
  .catch((err) => {
    client.emit("error", new Error(`Failure during setup: ${err}`));

    client.emit("warn", "Shutting down...");

    if (process.env.HEROKU_ENV) {
        clearInterval(herokuSleepDisabler);
    }
  })
