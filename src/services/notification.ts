import { DMChannel, User } from "discord.js";

export type BeforeNotifyFunction = (dmChannel: DMChannel, user: User, times: number, messageString: string) => void
const noopFunction: BeforeNotifyFunction = () => {}

export class NotificationService {
    private static instance: NotificationService;

    private constructor() {}

    public static getInstance() {
        if(!this.instance) {
            this.instance = new NotificationService();
        }
        return this.instance;
    }

    public async notifyUser(user: User, times: number, messageString: string, beforeMethod = noopFunction) {
        const dmChannel = await (user.dmChannel
            ? new Promise<DMChannel>((resolve) => resolve(user.dmChannel))
            : user.createDM());

        beforeMethod(dmChannel, user, times, messageString);

        for (let i = 0; i < times; ++i) {
            dmChannel.send(messageString).then(message => message.delete());
        }
    }
}