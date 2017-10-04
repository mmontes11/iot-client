import { Service } from "./service"

export class ObservationsService extends Service {
    constructor(client) {
        super(client, 'observations');
    }
}