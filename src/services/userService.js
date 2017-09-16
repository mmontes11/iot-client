import rest from 'restler';
import { Service } from './service';
import { HTTPMethod } from '../models/httpMethod';
import { HTTPRequestParams } from '../models/httpRequestParams';

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
        const requestParams = new HTTPRequestParams(HTTPMethod.POST, undefined, options, user);
        return this.createRequest(requestParams);
    }
    logIn() {
        const user = {
            username: this.userCredentials.username,
            password: this.userCredentials.password
        };
        const requestParams = new HTTPRequestParams(HTTPMethod.POST, '/logIn', undefined, user);
        return this.createRequest(requestParams);
    }
}