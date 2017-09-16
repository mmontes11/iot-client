import { Credentials } from './src/models/credentials';
import { UserService } from './src/services/userService';
import { AuthService } from './src/services/authService';
import defaultOptions from './config/defaultOptions'

export default class IotClient {
    constructor(optionsByParam) {
        const options = Object.assign({}, defaultOptions, optionsByParam);
        const basicAuthCredentials = new Credentials(options.basicAuthUsername, options.basicAuthPassword);
        const userCredentials = new Credentials(options.username, options.password);
        this.userService = new UserService(options.host, basicAuthCredentials, userCredentials, options.headers, undefined, options.debug);
        this.authService = new AuthService(this.userService);
    }
}