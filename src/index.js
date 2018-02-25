import _ from 'underscore';
import { Credentials } from './models/credentials';
import { AuthService } from './services/authService';
import { MeasurementService } from './services/observationService';
import { ObservationsService } from './services/observationsService';
import { TimePeriodsService } from './services/timePeriodsService';
import { ThingsService } from './services/thingsService';
import { Log } from './util/log';
import defaultOptions from './config/defaultOptions'

export default class IoTClient {
    constructor(optionsByParam) {
        this.mandatoryParams = ["host", "basicAuthUsername", "basicAuthPassword", "username", "password"];
        if (this._areValidOptions(optionsByParam)) {
            const options = Object.assign({}, defaultOptions, optionsByParam);
            const basicAuthCredentials = new Credentials(options.basicAuthUsername, options.basicAuthPassword);
            const userCredentials = new Credentials(options.username, options.password);
            this.host = options.host;
            this.headers = options.headers;
            this.log = new Log(options.debug);
            this.authService = new AuthService(this, basicAuthCredentials, userCredentials);
            this.measurementService = new MeasurementService(this);
            this.observationsService = new ObservationsService(this);
            this.timePeriodsService = new TimePeriodsService(this);
            this.thingsService = new ThingsService(this);
        } else {
            throw new Error(`IoT Client misconfiguration. Mandatory params: ${this.mandatoryParams.join(', ')}`);
        }
    }
    _areValidOptions(options) {
        for (const param of this.mandatoryParams) {
            if (_.isUndefined(options[param])) {
                return false
            }
        }
        return true;
    }
}