import storage from '../../lib/storage';
import _ from 'underscore';

const tokenKey = 'token';

export class AuthService {
    constructor(client) {
        this.client = client;
    }
    async getToken() {
        const tokenFromStorage = this.getTokenFromStorage();
        if (_.isUndefined(tokenFromStorage)) {
            try {
                const token = (await this.client.userService.logIn()).data.token;
                this.storeToken(token);
                return token;
            } catch (err) {
                this.invalidateToken();
                throw err;
            }
        } else {
            return tokenFromStorage;
        }
    }
    getTokenFromStorage() {
        return storage.getItemSync(tokenKey);
    }
    storeToken(token) {
        storage.setItemSync(tokenKey, token);
    }
    invalidateToken() {
        storage.clearSync();
    }
}