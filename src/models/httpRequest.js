import rest from 'restler';
import { HTTPMethod } from './httpMethod';
import { Log } from '../util/log';

export class HTTPRequest {
    constructor(method, url, options, data, debug) {
        this.method = method;
        this.url = url;
        this.options = options;
        this.data = data;
        this.log = new Log(debug);
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
        this.log.logRequest(request);
        return new Promise(function(resolve, reject) {
            request
                .on('success', (data, res) => {
                    resolve(data);
                })
                .on('fail', (data, res) => {
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