import winston from '../../lib/winston';

export class Log {
    constructor(debug) {
        this.debug = debug;
    }
    logRequest(request) {
        if (this.debug) {
            winston.info('Request:');
            winston.info(`${request.options.method} ${request.url.href}`);
            winston.info('Body:');
            winston.info(Log._prettyPrintJSON(JSON.parse(request.options.data)));
            winston.info('Headers:');
            winston.info(Log._prettyPrintJSON(request.headers));
        }
    }
    static _prettyPrintJSON(json) {
        return JSON.stringify(json, undefined, 2);
    }
}