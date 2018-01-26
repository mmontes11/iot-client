import { ObservationService } from "./observationService";
import {HTTPMethod} from "../models/httpMethod";
import { HTTPRequestParams } from "../models/httpRequestParams";

export class MeasurementService extends ObservationService {
    constructor(client) {
        super(client, 'measurement');
    }
    async getStats(query) {
        const options = {
            query
        };
        return this.get('stats', options);
    }
    async getStatsByType(type) {
        return this.getStats({ type });
    }
    async getStatsByThing(thing) {
        return this.getStats({ thing });
    }
    async getStatsByDateRange(startDate, endDate) {
        return this.getStats({ startDate, endDate });
    }
    async getStatsByLastTimePeriod(lastTimePeriod) {
        return this.getStats({ lastTimePeriod });
    }
    async getStatsByCoordinates(longitude, latitude, maxDistance) {
        return this.getStats({ longitude, latitude, maxDistance });
    }
    async getStatsByAddress(address, maxDistance) {
        return this.getStats({ address, maxDistance });
    }
}