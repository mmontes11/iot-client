import { Service } from "./service"

export class ThingsService extends Service {
    constructor(client) {
        super(client, 'things');
    }
    async getThings() {
        return this.get();
    }
}