import { CommandoClient } from "discord.js-commando";
import { Request, Response, Router } from "express";
import { WebEndpoint } from "../endpoint";

class HeartbeatEndpoint extends WebEndpoint {

    constructor(app: Router, discordClient: CommandoClient) {
        super(app, discordClient, "/heartbeat");
    }

    public handle(discordClient: CommandoClient, request: Request, response: Response) {
        response.status(200)
            .json({
                status: discordClient.ws.status,
                ping: discordClient.ws.ping,
                uptime: discordClient.uptime,
                botName: discordClient.user.username,
                guilds: discordClient.guilds.cache.size
            });
    }
}

export = HeartbeatEndpoint
