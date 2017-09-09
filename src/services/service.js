import { URLBuilder } from '../helpers/urlBuilder';
import { Log } from '../util/log';
import { HTTPMethod } from '../models/HTTPMethod';
import rest from 'restler';
import _ from 'underscore';

export class Service {
    constructor(host, restResource, debug) {
        this.urlBuilder = new URLBuilder(host, restResource);
        this.log = new Log(debug);
    }
    createRequest(method, options = {}, data = undefined, path = undefined) {
        let url;
        if (_.isUndefined(path)) {
            url = this.urlBuilder.resourceUrl
        } else {
            url = this.urlBuilder.build(path)
        }
        let request;
        switch (method) {
            case HTTPMethod.GET: {
                request = rest.get(url, options);
                break;
            }
            case HTTPMethod.POST: {
                request = rest.postJson(url, data, options);
                break;
            }
            case HTTPMethod.PUT: {
                request = rest.putJson(url, data, options);
                break;
            }
            case HTTPMethod.DELETE: {
                request = rest.delete(url, options);
                break
            }
        }
        this.log.logRequest(request);
        return request;
    }
}