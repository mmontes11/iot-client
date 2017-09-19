import { Service } from './service';
import { HTTPMethod } from '../models/httpMethod';
import { HTTPRequestParams } from '../models/httpRequestParams';

export class UserService extends Service {
    constructor(client) {
        super(client, 'user');
        this.client = client;
    }
    createUser(user) {
        const options = {
            username: this.client.basicAuthCredentials.username,
            password: this.client.basicAuthCredentials.password,
        };
        const requestParams = new HTTPRequestParams(HTTPMethod.POST, undefined, options, user);
        return this.request(requestParams, false);
    }
    logIn() {
        const user = {
            username: this.client.userCredentials.username,
            password: this.client.userCredentials.password
        };
        const requestParams = new HTTPRequestParams(HTTPMethod.POST, 'logIn', undefined, user);
        return this.request(requestParams, false);
    }
}