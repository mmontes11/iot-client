import storage from '../lib/storage';
import _ from 'underscore';

const tokenKey = 'token';

export class TokenHandler {
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