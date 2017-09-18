import rest from 'restler';
import { Service } from './service';
import { HTTPMethod } from '../models/httpMethod';
import { HTTPRequestParams } from '../models/httpRequestParams';

export class UserService extends Service {
    constructor(client, host, basicAuthCredentials, userCredentials, headers) {
        super(client, host, 'user', headers);
        this.basicAuthCredentials = basicAuthCredentials;
        this.userCredentials = userCredentials;
    }
    createUser(user) {
        const options = {
            username: this.basicAuthCredentials.username,
            password: this.basicAuthCredentials.password,
        };
        const requestParams = new HTTPRequestParams(HTTPMethod.POST, undefined, options, user);
        return this.request(requestParams, false);
    }
    logIn() {
        const user = {
            username: this.userCredentials.username,
            password: this.userCredentials.password
        };
        const requestParams = new HTTPRequestParams(HTTPMethod.POST, 'logIn', undefined, user);
        return this.request(requestParams, false);
    }
}