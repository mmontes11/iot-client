import { Credentials } from './models/credentials';
import { TokenHandler } from './helpers/tokenHandler';
import { UserService } from './services/userService';
import { MeasurementService } from './services/observationService';
import { ObservationsService } from './services/observationsService';
import { TimePeriodsService } from './services/timePeriodsService';
import { ThingsService } from './services/thingsService';
import { Log } from './util/log';
import defaultOptions from './config/defaultOptions'

export default class IoTClient {
    constructor(optionsByParam) {
        const options = Object.assign({}, defaultOptions, optionsByParam);
        const basicAuthCredentials = new Credentials(options.basicAuthUsername, options.basicAuthPassword);
        const userCredentials = new Credentials(options.username, options.password);
        this.host = options.host;
        this.headers = options.headers;
        this.log = new Log(options.debug);
        this.tokenHandler = new TokenHandler(this, basicAuthCredentials, userCredentials);
        this.userService = new UserService(this);
        this.measurementService = new MeasurementService(this);
        this.observationsService = new ObservationsService(this);
        this.timePeriodsService = new TimePeriodsService(this);
        this.thingsService = new ThingsService(this);
    }
}