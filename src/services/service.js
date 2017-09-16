import rest from 'restler';
import _ from 'underscore';
import { URLBuilder } from '../helpers/urlBuilder';
import { HTTPRequest } from '../models/httpRequest';

export class Service {
    constructor(host, restResource, headers, debug) {
        this.urlBuilder = new URLBuilder(host, restResource);
        this.headers = headers;
        this.debug = debug;
    }
    createRequest(requestParams) {
        let url;
        if (_.isUndefined(requestParams.path)) {
            url = this.urlBuilder.resourceUrl
        } else {
            url = this.urlBuilder.build(requestParams.path)
        }
        const options = Object.assign({}, { headers: this.headers }, requestParams.options);
        const httpRequest = new HTTPRequest(requestParams.method, url, options, requestParams.data, this.debug);
        return httpRequest.start();
    }
}