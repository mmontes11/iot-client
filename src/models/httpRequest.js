import rest from 'restler';
import { HTTPMethod } from './httpMethod';
import { Log } from '../util/log';
import { AuthService} from "../services/authService"
import httpStatus from 'http-status';
import _ from 'underscore';

export class HTTPRequest {
    constructor(method, url, options, data, log) {
        this.id = (new Date()).getTime();
        this.method = method;
        this.url = url;
        this.options = options;
        this.data = data;
        this.log = log;
    }
    _createRequest() {
        switch (this.method) {
            case HTTPMethod.GET: {
                return rest.get(this.url, this.options);
            }
            case HTTPMethod.POST: {
                return rest.postJson(this.url, this.data, this.options);
            }
            case HTTPMethod.PUT: {
                return rest.putJson(this.url, this.data, this.options);
            }
            case HTTPMethod.DELETE: {
                return rest.delete(this.url, this.options);
            }
        }
        return undefined;
    }
    start() {
        const request = this._createRequest();
        const requestId = this.id;
        const log = this.log;
        log.logRequest(request, requestId);
        return new Promise((resolve, reject) => {
            request
                .on('success', (data, response) => {
                    log.logInfo(`Request ${requestId} succeeded`);
                    log.logResponse(data, response, requestId);
                    resolve({
                        statusCode: response.statusCode,
                        headers: response.headers,
                        body: data
                    });
                })
                .on('fail', (data, response) => {
                    log.logInfo(`Request ${requestId} failed`);
                    log.logResponse(data, response, requestId);
                    if (_.isEqual(response.statusCode, httpStatus.UNAUTHORIZED)) {
                        AuthService.invalidateToken();
                    }
                    reject({
                        statusCode: response.statusCode,
                        headers: response.headers,
                        body: data
                    });
                })
                .on('error', (err, res) => {
                    log.logError(`Request ${requestId} errored`);
                    reject(err);
                })
                .on('abort', () => {
                    log.logInfo(`Request ${requestId} aborted`);
                    reject();
                })
                .on('timeout', (ms) => {
                    log.logError(`Request ${requestId} timeout`);
                    reject();
                });
        });
    }
}