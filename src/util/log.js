import winston from '../lib/winston';

export class Log {
    constructor(debug) {
        this.debug = debug;
    }
    logRequest(request, id) {
        if (this.debug) {
            winston.info(`Request ${id} ${request.options.method} ${request.url.href}`);
            winston.info(`Request ${id} Body`);
            winston.info(Log._prettyPrintJSON(JSON.parse(request.options.data)));
            winston.info(`Request ${id} Headers`);
            winston.info(Log._prettyPrintJSON(request.headers));
        }
    }
    logResponse(response, data, id) {
        if (this.debug) {
            winston.info(`Response ${id} ${response.statusCode} ${response.statusMessage}`);
            winston.info(`Response ${id} Body`);
            winston.info(Log._prettyPrintJSON(data));
            winston.info(`Response ${id} Headers`);
            winston.info(Log._prettyPrintJSON(response.headers));
        }
    }
    static _prettyPrintJSON(json) {
        return JSON.stringify(json, undefined, 2);
    }
}