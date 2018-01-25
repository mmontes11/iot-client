import winston from '../lib/winston';
import _ from 'underscore';

export class Log {
    constructor(debug) {
        this.debug = debug;
    }
    logInfo(message) {
        winston.info(message);
    }
    logError(message) {
        winston.error(message);
    }
    logRequest(request, id) {
        if (this.debug) {
            const method = request.options.method, url = request.url.href;
            if (!_.isUndefined(method) && !_.isUndefined(url)) {
                winston.info(`Request ${id} ${method} ${url}`);
            }
            const query = request.options.query;
            if (!_.isUndefined(query)) {
                winston.info(`Request ${id} Query Params`);
                winston.info(Log._prettyPrintJSON(query));
            }
            const body = request.options.data;
            if (!_.isUndefined(body)) {
                winston.info(`Request ${id} Body`);
                winston.info(Log._prettyPrintJSON(JSON.parse(body)));
            }
            const headers = request.headers;
            if (!_.isUndefined(headers)) {
                winston.info(`Request ${id} Headers`);
                winston.info(Log._prettyPrintJSON(headers));
            }
        }
    }
    logResponse(body, response, id) {
        if (this.debug) {
            const statusCode = response.statusCode, statusMessage = response.statusMessage;
            if (!_.isUndefined(statusCode) && !_.isUndefined(statusMessage)) {
                winston.info(`Response ${id} ${statusCode} ${statusMessage}`);
            }
            if (!_.isUndefined(body)) {
                winston.info(`Response ${id} Body`);
                winston.info(Log._prettyPrintJSON(body));
            }
            const headers = response.headers;
            if (!_.isUndefined(headers)) {
                winston.info(`Response ${id} Headers`);
                winston.info(Log._prettyPrintJSON(headers));
            }
        }
    }
    static _prettyPrintJSON(json) {
        return JSON.stringify(json, undefined, 2);
    }
}