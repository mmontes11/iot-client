import { Service } from './service';
import { HTTPMethod } from '../models/httpMethod';
import { HTTPRequestParams } from '../models/httpRequestParams';
import { TokenHandler } from '../helpers/tokenHandler';
import _ from 'underscore';

export class AuthService extends Service {
    constructor(client, basicAuthCredentials, userCredentials) {
        super(client, 'user');
        this.basicAuthCredentials = basicAuthCredentials;
        this.userCredentials = userCredentials;
    }
    async createUser(user) {
        const options = {
            username: this.basicAuthCredentials.username,
            password: this.basicAuthCredentials.password,
        };
        return this.post(undefined, options, user, false);
    }
    async getToken() {
        const tokenFromStorage = TokenHandler.getTokenFromStorage();
        if (_.isUndefined(tokenFromStorage)) {
            try {
                const token = (await this._getToken()).body.token;
                TokenHandler.storeToken(token);
                return token;
            } catch (err) {
                TokenHandler.invalidateToken();
                throw err;
            }
        } else {
            return tokenFromStorage;
        }
    }
    async _getToken() {
        const user = {
            username: this.userCredentials.username,
            password: this.userCredentials.password
        };
        return this.post('logIn', undefined, user, false);
    }
}