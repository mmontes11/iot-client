import { Credentials } from './src/models/credentials';
import { UserService } from './src/services/userService';

export default class IotClient {
    constructor(host, basicAuthUser, basicAuthPassword, user, password) {
        const basicAuthCredentials = new Credentials(basicAuthUser, basicAuthPassword);
        const userCredentials = new Credentials(user, password);
        this.userService = new UserService(host, basicAuthCredentials, userCredentials);
    }
}