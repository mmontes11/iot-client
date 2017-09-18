import rest from 'restler';
import { HTTPMethod } from './httpMethod';
import { Log } from '../util/log';

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
                .on('success', (data, res) => {
                    log.logResponse(res, data, requestId);
                    resolve(data);
                })
                .on('fail', (data, res) => {
                    log.logResponse(res, data, requestId);
                    reject(res);
                })
                .on('error', (err, res) => {
                    reject(err);
                })
                .on('abort', () => {
                    reject();
                })
                .on('timeout', (ms) => {
                    reject();
                });
        });
    }
}