import { Service } from './service';
import { HTTPMethod } from '../models/httpMethod';
import { HTTPRequestParams } from '../models/httpRequestParams';
import _ from 'underscore';

export class ObservationService extends Service {
    constructor(client, resource) {
        if (_.isUndefined(resource)) {
            resource = 'observation';
        }
        super(client, resource);
    }
    async create(data) {
        const requestParams = new HTTPRequestParams(HTTPMethod.POST, undefined, undefined, data);
        return this.request(requestParams, true);
    }
}