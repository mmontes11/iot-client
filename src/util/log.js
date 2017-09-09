import winston from '../../lib/winston';

export class Log {
    constructor(debug) {
        this.debug = debug;
    }
    logRequest(request) {
        if (this.debug) {
            winston.info('Request:');
            winston.info(`${request.options.method} ${request.url.href}`);
            winston.info('Headers:');
            winston.info(`${this._prettyPrintJSON(request.headers)}`);
        }
    }
    _prettyPrintJSON(json) {
        return JSON.stringify(json, undefined, 2);
    }
}