import nodePersist from "node-persist";

const tokenKey = "token";

export class TokenHandler {
  static async initStorage() {
    if (!TokenHandler._isBrowserStorageAvailable()) {
      await nodePersist.init();
    }
  }
  static async getToken() {
    const storage = TokenHandler._getStorage();
    return storage.getItem(tokenKey);
  }
  static async storeToken(token) {
    const storage = TokenHandler._getStorage();
    return storage.setItem(tokenKey, token);
  }
  static async invalidateToken() {
    const storage = TokenHandler._getStorage();
    await storage.clear();
  }
  static _getStorage() {
    if (TokenHandler._isBrowserStorageAvailable()) {
      return window.localStorage;
    }
    return nodePersist;
  }
  static _isBrowserStorageAvailable() {
    return typeof window !== "undefined";
  }
}
