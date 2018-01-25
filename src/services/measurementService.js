import { ObservationService } from "./observationService";
import {HTTPMethod} from "../models/httpMethod";
import { HTTPRequestParams } from "../models/httpRequestParams";

export class MeasurementService extends ObservationService {
    constructor(client) {
        super(client, 'measurement');
    }
    async getStats(type, thing, startDate, endDate, timePeriod, longitude, latitude, address, maxDistance) {
        const options = {
            query: {
                type,
                thing,
                startDate,
                endDate,
                timePeriod,
                longitude,
                latitude,
                address,
                maxDistance
            }
        };
        const requestParams = new HTTPRequestParams(HTTPMethod.GET, 'stats', options);
        return this.request(requestParams, true);
    }
}