import _ from "underscore";
import { Service } from "./service";
import { TokenHandler } from "../helpers/tokenHandler";

export class AuthService extends Service {
  constructor(client, basicAuthCredentials, userCredentials) {
    super(client, "auth");
    this.basicAuthCredentials = basicAuthCredentials;
    this.userCredentials = userCredentials;
  }
  async checkAuth(user) {
    return this._postWithBasicAuthCredentials(undefined, user);
  }
  async createUser(user) {
    return this._postWithBasicAuthCredentials("user", user);
  }
  async getToken() {
    const tokenFromStorage = TokenHandler.getTokenFromStorage();
    if (_.isUndefined(tokenFromStorage)) {
      try {
        const {
          body: { token },
        } = await this._getToken();
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
  async _postWithBasicAuthCredentials(path, data) {
    const basicAuthOptions = {
      username: this.basicAuthCredentials.username,
      password: this.basicAuthCredentials.password,
    };
    return this.post(path, basicAuthOptions, data, false);
  }
  async _getToken() {
    const user = {
      username: this.userCredentials.username,
      password: this.userCredentials.password,
    };
    return this._postWithBasicAuthCredentials("token", user);
  }
}
