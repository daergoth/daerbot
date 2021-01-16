import { CommandoClient } from "discord.js-commando";
import express from "express";
import { join } from "path";
import glob from "glob";
import { WebEndpoint } from "../endpoints/endpoint";

export class WebEndpointLoader {
    private portNum: number;
    private endpointsGlob: string;
    private app;
    private router;

    constructor(endpointsPath: string, portNum: number) {
        this.portNum = portNum;
        this.endpointsGlob = join(endpointsPath, "*.js");

        this.app = express();
        this.app.use((req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });

        this.router = express.Router();

        this.app.use("/api", this.router);
    }

    public load(discordClient: CommandoClient) {
        return new Promise<WebEndpoint[]>((resolve, reject) => {
            glob(this.endpointsGlob, (err, matches) => {
                if (err) {
                    return reject(err);
                }

                const endpoints = matches.forEach((endpointPath) => this.loadEndpoint(endpointPath, discordClient));

                resolve(endpoints);
            });
        });
    }

    public loadEndpoint(endpointPath: string, discordClient: CommandoClient): WebEndpoint {
        let endpoint;

        try {
            endpoint = require(endpointPath);
        } catch (err) {
            console.log("Could not load endpoint:", endpointPath);

            return;
        }

        const result = new endpoint(this.router, discordClient);

        console.log("Loaded endpoint:", endpointPath);

        return result;
    }

    public start() {
        this.app.listen(this.portNum, () => {
            console.log(`REST endpoints started, listening on ${this.portNum}!`);
        });
    }



}
