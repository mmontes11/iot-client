import rest from 'restler';
import _ from 'underscore';
import { URLBuilder } from '../helpers/urlBuilder';
import { HTTPRequest } from '../models/httpRequest';

export class Service {
    constructor(client, host, resource, headers, debug) {
        this.client = client;
        this.urlBuilder = new URLBuilder(host, resource);
        this.headers = headers;
        this.debug = debug;
    }
    async request(requestParams, includeToken) {
        let token = undefined;
        if (includeToken) {
            try {
                token = client.authService.getToken();
            } catch (err) {
                throw err;
            }
        }
        const httpRequest = this._setupRequest(requestParams, token);
        return await httpRequest.start();
    }
    _setupRequest(requestParams, token) {
        let url;
        if (_.isUndefined(requestParams.path)) {
            url = this.urlBuilder.resourceUrl
        } else {
            url = this.urlBuilder.build(requestParams.path)
        }
        const serviceOptions = {
            headers: this.headers,
            accessToken: token
        };
        const options = Object.assign({}, serviceOptions, requestParams.options);
        return new HTTPRequest(requestParams.method, url, options, requestParams.data, this.debug);
    }
}