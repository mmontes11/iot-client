import rest from 'restler';
import { Service } from './service';
import { HTTPMethod } from '../models/HTTPMethod';

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
        const request = super.createRequest(HTTPMethod.POST, options, user);
        return new Promise(function(resolve, reject) {
            request
                .on('success', (data) => {
                    resolve(data);
                })
                .on('error', (err) => {
                    reject(err);
                })
        });
    }
}