---
---
# DaerBot

A simple Discord Bot developed for fun

_This bot is only a fun project to learn JS, there are no promises that it will be even remotely functional._

To invite the bot the to your server just click this link:  
[Invite DaerBot to your Discord server](https://discordapp.com/oauth2/authorize?client_id=360146475033821184&scope=bot&permissions=2146696311)  
(Disabled for now...)

## [Commands](commands.md)

## Install & Run

You will have to set `BOT_TOKEN` environment variable with your Discord Bot token.  

Also if you plan to run the bot on Heroku, you should set the `HEROKU_ENV` environment variable, too.

After that:

```
npm install 

npm start
```
If the `I am ready` message shows up on the console the bot is up and running!

The default port number for REST requests is `3000`,
but you can set it with the `PORT` environment variable.
