import { Credentials } from './src/models/credentials';
import { AuthService } from './src/services/authService';
import { UserService } from './src/services/userService';
import { MeasurementService } from "./src/services/measurementService"
import { Log } from './src/util/log';
import defaultOptions from './config/defaultOptions'

export default class IotClient {
    constructor(optionsByParam) {
        const options = Object.assign({}, defaultOptions, optionsByParam);
        this.host = options.host;
        this.basicAuthCredentials = new Credentials(options.basicAuthUsername, options.basicAuthPassword);
        this.userCredentials = new Credentials(options.username, options.password);
        this.headers = options.headers;
        this.log = new Log(options.debug);
        this.authService = new AuthService(this);
        this.userService = new UserService(this);
        this.measurementService = new MeasurementService(this);
    }
}