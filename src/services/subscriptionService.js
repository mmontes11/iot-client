import { Service } from "./service"

export class SubscriptionService extends Service {
    constructor(client) {
        super(client, 'subscription');
    }
    async create(subscription) {
        return this.post(undefined, undefined, subscription);
    }
}