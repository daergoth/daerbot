const Router = require('./router');
const Configuration = require('./configuration');

const client = (function makeDiscordClient() {
    if (process.env.CANT_LOAD_DISCORD_BECAUSE_I_CANT_BUILD_IT) {
        return {
            on(...args) {
                console.log('on called with:', ...args);
            },
            login(...args) {
                console.log('login called with:', ...args);
            }
        };
    } else {
        const Discord = require('discord.js');

        return new Discord.Client();
    }
})();

const commandRouter = Object.create(Router);

Configuration.reloadConfiguration()
    .then(function configurationLoaded() {        
        commandRouter.Router();

        return commandRouter.reloadCommandModules();
    })
    .then(function commandModulesLoaded() {
        client.on('ready', () => console.log('I am ready!'));
        
        client.on('message', function handleMessage(message) {
            const handler = commandRouter.route(message);

            handler(client);
        });
        
        client.login(process.env.BOT_TOKEN);        
    })
    .then(function test() {
        if (process.env.CANT_LOAD_DISCORD_BECAUSE_I_CANT_BUILD_IT) {
            testWithMockMessages();
        }
    })
    .catch(function failure(err) {
        console.log('Failure during setup:', err);

        console.log('Shutting down...');
    });

function testWithMockMessages() {
    function produceMockMessage(content) {
        return {
            content,
            channel: {
                send(message) {
                    console.log(`Wanted to send message "${message}."`);
                }
            }
        }
    }

    const handler = commandRouter.route(produceMockMessage('.ping'));

    handler();
}
