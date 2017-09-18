import { Credentials } from './src/models/credentials';
import { UserService } from './src/services/userService';
import { AuthService } from './src/services/authService';
import { Log } from './src/util/log';
import defaultOptions from './config/defaultOptions'

export default class IotClient {
    constructor(optionsByParam) {
        const options = Object.assign({}, defaultOptions, optionsByParam);
        const basicAuthCredentials = new Credentials(options.basicAuthUsername, options.basicAuthPassword);
        const userCredentials = new Credentials(options.username, options.password);
        this.log = new Log(options.debug);
        this.userService = new UserService(this, options.host, basicAuthCredentials, userCredentials, options.headers);
        this.authService = new AuthService(this);
    }
}