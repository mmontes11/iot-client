import chai from '../lib/chai';
import server from '../iot_backend/index';
import serverConfig from '../iot_backend/config/index';
import { UserModel } from '../iot_backend/src/models/db/user';
import { Credentials } from '../src/models/credentials';
import { UserService } from '../src/services/userService';
import { AuthService } from '../src/services/authService';
import constants from './constants';
import defaultOptions from '../config/defaultOptions'

const assert = chai.assert;
const should = chai.should();
const host = `http://localhost:${serverConfig.nodePort}`;
const basicAuthUsername = Object.keys(serverConfig.basicAuthUsers)[0];
const basicAuthPassword = serverConfig.basicAuthUsers[basicAuthUsername];
const username = constants.validUser.username;
const password = constants.validUser.password;
const basicAuthCredentials = new Credentials(basicAuthUsername, basicAuthPassword);
const userCredentials = new Credentials(username, password);
const invalidCredentials = new Credentials('foo', 'bar');
const userService = new UserService(host, basicAuthCredentials, userCredentials, defaultOptions.headers, undefined, defaultOptions.debug);
const userServiceWithInvalidCredentials = new UserService(host, invalidCredentials, invalidCredentials, defaultOptions.headers, undefined, defaultOptions.debug);
const authService = new AuthService(userService);
const authServiceWithInvalidCredentials = new AuthService(userServiceWithInvalidCredentials);

describe('Auth', () => {

    beforeEach((done) => {
        AuthService.invalidateToken();
        assert(AuthService.getTokenFromStorage() === undefined, 'Token should be undefined');
        UserModel.remove({}, (err) => {
            assert(err !== undefined, 'Error cleaning MongoDB for tests');
            userService.createUser(constants.validUser)
                .then(() => {
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
    });

    it('gets a token for an user with invalid credentials', (done) => {
        authServiceWithInvalidCredentials.getToken()
            .then((token) => {
                done(new Error('Promise should be rejected'));
            })
            .catch((err) => {
                should.exist(err);
                should.not.exist(AuthService.getTokenFromStorage());
                done();
            });
    });

    it('gets a token for a valid user', (done) => {
        authService.getToken()
            .then((token) => {
                token.should.be.equal(AuthService.getTokenFromStorage());
                authService.getToken()
                    .then((token) => {
                        token.should.be.equal(AuthService.getTokenFromStorage());
                        done();
                    })
                    .catch((err) => {
                        done(err);
                    });
            })
            .catch((err) => {
                done(err);
            });
    });

    it('gets a token for a valid user and deletes it', (done) => {
        authService.getToken()
            .then((token) => {
                token.should.be.equal(AuthService.getTokenFromStorage());
                AuthService.invalidateToken();
                should.not.exist(AuthService.getTokenFromStorage());
                done();
            })
            .catch((err) => {
                done(err);
            });
    });
});