import storage from '../../lib/storage';
import _ from 'underscore';

const tokenKey = 'token';

export class AuthService {
    constructor(userService) {
        this.userService = userService
    }
    async getToken() {
        const tokenFromStorage = AuthService.getTokenFromStorage();
        if (_.isUndefined(tokenFromStorage)) {
            try {
                const token = (await this.userService.logIn()).token;
                AuthService.storeToken(token);
                return token;
            } catch (err) {
                AuthService.invalidateToken();
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