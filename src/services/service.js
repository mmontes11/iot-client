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
    createRequest(HTTPMethod, optionsByParam, data, path) {
        let url;
        if (_.isUndefined(path)) {
            url = this.urlBuilder.resourceUrl
        } else {
            url = this.urlBuilder.build(path)
        }
        const options = Object.assign({}, { headers: this.headers }, optionsByParam);
        const httpRequest = new HTTPRequest(HTTPMethod, url, options, data, this.debug);
        return httpRequest.start();
    }
}