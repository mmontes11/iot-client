import rest from 'restler';
import { Service } from './service';
import { HTTPMethod } from '../models/httpMethod';

export class UserService extends Service {
    constructor(host, basicAuthCredentials, userCredentials, headers, debug) {
        super(host, 'user', headers, debug);
        this.basicAuthCredentials = basicAuthCredentials;
        this.userCredentials = userCredentials;
    }
    createUser(user) {
        const options = {
            username: this.basicAuthCredentials.username,
            password: this.basicAuthCredentials.password,
        };
        return this.createRequest(HTTPMethod.POST, options, user);
    }
    logIn() {
        const user = {
            username: this.userCredentials.username,
            password: this.userCredentials.password
        };
        return this.createRequest(HTTPMethod.POST, null, user, '/logIn');
    }
}