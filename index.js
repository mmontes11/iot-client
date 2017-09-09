import { Credentials } from './src/models/credentials';
import { UserService } from './src/services/userService';
import defaultOptions from './config/defaultOptions'

export default class IotClient {
    constructor(optionsByParam) {
        const options = Object.assign({}, defaultOptions, optionsByParam);
        const basicAuthCredentials = new Credentials(options.basicAuthUser, options.basicAuthPassword);
        const userCredentials = new Credentials(options.user, options.password);
        this.userService = new UserService(options.host, basicAuthCredentials, options.headers, options.debug);
    }
}