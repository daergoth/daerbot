const path = require("path");
const glob = require("glob");
const express = require("express");

const ENDPOINTS_GLOB = path.join(__dirname, "endpoints", "*.js");

const RestLoader = {
    RestLoader(portNum) {
        this.port = portNum;

        this.app = express();
        this.app.use(function (req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });
    },
    load(discordClient) {
        return new Promise(function (resolve, reject) {
            glob(ENDPOINTS_GLOB, function resolveMatches(err, matches) {
                if (err) {
                    return reject(err);
                }

                matches.forEach(function (endpointPath) {
                    this.loadEndpoint(endpointPath, discordClient);
                }, this);

                resolve();
            }.bind(this));
        }.bind(this));
    },
    loadEndpoint(endpointPath, discordClient) {
        let endpoint;

        try {
            endpoint = require(endpointPath);
        } catch (err) {
            console.log("Could not load endpoint:", endpointPath);

            return;
        }

        if (!Object.prototype.hasOwnProperty.call(endpoint, "registerEndpoints")) {
            console.log("Malformed endpoint:", endpointPath);

            return;
        }

        endpoint.registerEndpoints(this.app, discordClient);

        console.log("Loaded endpoint:", endpointPath);
    },
    start() {
        this.app.listen(this.port, function () {
            console.log(`REST endpoints started, listening on ${this.port}!`);
        }.bind(this));
    }
};

module.exports = RestLoader;