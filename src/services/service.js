import rest from 'restler';
import _ from 'underscore';
import { URLBuilder } from '../helpers/urlBuilder';
import { HTTPRequest } from '../models/httpRequest';

export class Service {
    constructor(host, restResource, debug) {
        this.urlBuilder = new URLBuilder(host, restResource);
        this.debug = debug;
    }
    createRequest(HTTPMethod, options, data = undefined, path = undefined) {
        let url;
        if (_.isUndefined(path)) {
            url = this.urlBuilder.resourceUrl
        } else {
            url = this.urlBuilder.build(path)
        }
        const httpRequest = new HTTPRequest(HTTPMethod, url, options, data, this.debug);
        return httpRequest.start();
    }
}