const GetHeartbeatEndpoint = {
    GetHeartbeatEndpoint(app, discordClient) {
        app.get("/heartbeat", this.handle.bind(this, discordClient));
    },
    handle(discordClient, req, res) {
        res
            .status(200)
            .json(
                { 
                    status: discordClient.status,
                    ping: discordClient.ping,
                    uptime: discordClient.uptime,
                    botName: discordClient.user.username,
                    guilds: discordClient.guilds.size
                }
            );
    }
};

function registerEndpoints(app, discordClient) {
    let getHeartbeatEndpoint = Object.create(GetHeartbeatEndpoint);
    getHeartbeatEndpoint.GetHeartbeatEndpoint(app, discordClient);
}

module.exports = {
    registerEndpoints
};