import { CommandoClient } from "discord.js-commando";
import { Request, Response, Router } from "express";

export abstract class WebEndpoint {
    constructor(app: Router, discordClient: CommandoClient, path: string) {
        app.get(path, this.handle.bind(this, discordClient));
    }

    public abstract handle(discordClient: CommandoClient, request: Request, response: Response): void;
}
