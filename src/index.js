import _ from 'underscore';
import { Credentials } from './models/credentials';
import { AuthService } from './services/authService';
import { MeasurementService } from './services/observationService';
import { ObservationsService } from './services/observationsService';
import { TimePeriodsService } from './services/timePeriodsService';
import { ThingService } from './services/thingService';
import { ThingsService } from './services/thingsService';
import { SubscriptionService } from './services/subscriptionService';
import { SubscriptionsService } from './services/subscriptionsService';
import { Log } from './util/log';
import defaultOptions from './config/defaultOptions'

export default class IoTClient {
    constructor(optionsByParam) {
        this.mandatoryParams = ["url", "basicAuthUsername", "basicAuthPassword", "username", "password"];
        if (this._areValidOptions(optionsByParam)) {
            const options = Object.assign({}, defaultOptions, optionsByParam);
            const basicAuthCredentials = new Credentials(options.basicAuthUsername, options.basicAuthPassword);
            const userCredentials = new Credentials(options.username, options.password);
            this.url = options.url;
            this.headers = options.headers;
            this.log = new Log(options.debug);
            this.authService = new AuthService(this, basicAuthCredentials, userCredentials);
            this.measurementService = new MeasurementService(this);
            this.observationsService = new ObservationsService(this);
            this.timePeriodsService = new TimePeriodsService(this);
            this.thingService = new ThingService(this);
            this.thingsService = new ThingsService(this);
            this.subscriptionService = new SubscriptionService(this);
            this.subscriptionsService = new SubscriptionsService(this);
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