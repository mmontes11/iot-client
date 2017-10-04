import { ObservationService } from "./observationService"

export class ObservationsService extends ObservationService {
    constructor(client) {
        super(client, 'observations');
    }
}