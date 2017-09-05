import rest from 'restler';
import { URLBuilder } from '../helpers/urlBuilder';
import { RequestOptions } from "../models/requestOptions"

export class UserService {
    constructor(host, basicAuthCredentials, credentials) {
        this.urlBuilder = new URLBuilder(host, 'user');
        this.basicAuthCredentials = basicAuthCredentials;
        this.credentials = credentials;
    }
    createUser(user) {
        const createUserUrl = this.urlBuilder.resourceUrl;
        const options = {
            username: this.basicAuthCredentials.username,
            password: this.basicAuthCredentials.password
        };
        return new Promise(function(resolve, reject) {
            rest.postJson(createUserUrl, user, options)
                .on('success', (data) => {
                    resolve(data);
                })
                .on('error', (err) => {
                    reject(err);
                })
        });
    }
}