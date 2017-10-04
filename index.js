import { Credentials } from './src/models/credentials';
import { AuthService } from './src/services/authService';
import { UserService } from './src/services/userService';
import { MeasurementService } from "./src/services/measurementService"
import { Log } from './src/util/log';
import defaultOptions from './config/defaultOptions'

export default class IotClient {
    constructor(optionsByParam) {
        const options = Object.assign({}, defaultOptions, optionsByParam);
        const basicAuthCredentials = new Credentials(options.basicAuthUsername, options.basicAuthPassword);
        const userCredentials = new Credentials(options.username, options.password);
        this.host = options.host;
        this.headers = options.headers;
        this.log = new Log(options.debug);
        this.authService = new AuthService(this, basicAuthCredentials, userCredentials);
        this.userService = new UserService(this);
        this.measurementService = new MeasurementService(this);
    }
}