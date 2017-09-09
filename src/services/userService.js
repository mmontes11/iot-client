import rest from 'restler';
import { Service } from './service';
import { HTTPMethod } from '../models/httpMethod';

export class UserService extends Service {
    constructor(host, basicAuthCredentials, debug) {
        super(host, 'user', debug);
        this.basicAuthCredentials = basicAuthCredentials;
    }
    createUser(user) {
        const options = {
            username: this.basicAuthCredentials.username,
            password: this.basicAuthCredentials.password,
        };
        return this.createRequest(HTTPMethod.POST, options, user);
    }
}