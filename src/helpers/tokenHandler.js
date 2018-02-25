import storage from '../lib/storage';
import _ from 'underscore';

const tokenKey = 'token';

export class TokenHandler {
    constructor(client, basicAuthCredentials, userCredentials) {
        this.client = client;
        this.basicAuthCredentials = basicAuthCredentials;
        this.userCredentials = userCredentials;
    }
    async getToken() {
        const tokenFromStorage = TokenHandler.getTokenFromStorage();
        if (_.isUndefined(tokenFromStorage)) {
            try {
                const token = (await this.client.userService.logIn()).body.token;
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
    static getTokenFromStorage() {
        return storage.getItemSync(tokenKey);
    }
    static storeToken(token) {
        storage.setItemSync(tokenKey, token);
    }
    static invalidateToken() {
        storage.clearSync();
    }
}