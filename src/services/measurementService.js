import { ObservationService } from "./observationService"

export class MeasurementService extends ObservationService {
    constructor(client) {
        super(client, 'measurement');
    }
}