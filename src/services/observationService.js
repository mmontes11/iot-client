import { Service } from './service';
import { HTTPMethod } from '../models/httpMethod';
import { HTTPRequestParams } from '../models/httpRequestParams';

export class ObservationService extends Service {
    constructor(client, resource) {
        super(client, resource);
    }
    async create(observation) {
        const requestParams = new HTTPRequestParams(HTTPMethod.POST, undefined, undefined, observation);
        return this.request(requestParams, true);
    }
}