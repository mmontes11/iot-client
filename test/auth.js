import chai from './lib/chai';
import httpStatus from 'http-status'
import server from './lib/iot-backend/src/index';
import serverConfig from './lib/iot-backend/src/config/index';
import { UserModel } from './lib/iot-backend/src/models/user';
import { TokenHandler } from "../src/helpers/tokenHandler";
import IoTClient from '../src/index';
import serverConstants from './lib/iot-backend/test/constants/user';
import clientConstants from './constants/auth';
import measurementConstants from './lib/iot-backend/test/constants/measurement';

const assert = chai.assert;
const should = chai.should();
const host = `http://localhost:${serverConfig.nodePort}`;
const basicAuthUsername = Object.keys(serverConfig.basicAuthUsers)[0];
const basicAuthPassword = serverConfig.basicAuthUsers[basicAuthUsername];
const username = serverConstants.validUser.username;
const password = serverConstants.validUser.password;
const client = new IoTClient({
    host,
    basicAuthUsername,
    basicAuthPassword,
    username,
    password
});
const clientWithInvalidCredentials = new IoTClient({
    host,
    basicAuthUsername: 'foo',
    basicAuthPassword: 'bar',
    username: 'foo',
    password: 'bar'
});

describe('Auth', () => {

    beforeEach((done) => {
        TokenHandler.invalidateToken();
        assert(TokenHandler.getTokenFromStorage() === undefined, 'Token should be undefined');
        UserModel.remove({}, (err) => {
            assert(err !== undefined, 'Error cleaning MongoDB for tests');
            client.authService.createUser(serverConstants.validUser)
                .then(() => {
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
    });

    describe('POST /user 401', () => {
        it('tries to createUser a user with invalid credentials', (done) => {
            const promise = clientWithInvalidCredentials.authService.createUser(serverConstants.validUser);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.UNAUTHORIZED)
                .and.notify(done);
        })
    });

    describe('POST /user 400', () => {
        it('tries to createUser an invalid user', (done) => {
            const promise = client.authService.createUser(serverConstants.invalidUser);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.BAD_REQUEST)
                .and.notify(done);
        });
        it('tries to createUser a user with weak password', (done) => {
            const promise = client.authService.createUser(serverConstants.userWithWeakPassword);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.BAD_REQUEST)
                .and.notify(done);
        });
    });

    describe('POST /user 409', () => {
        it('creates the same user twice', (done) => {
            const promise = client.authService.createUser(serverConstants.validUser);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.CONFLICT)
                .and.notify(done);
        });
    });

    describe('POST /user/logIn 401', () => {
        it('tries to get a token with a non existing user', (done) => {
            const promise = clientWithInvalidCredentials.authService.getToken();
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.UNAUTHORIZED)
                .and.notify(done);
        });
        it('tries to get a token with an user with invalid credentials', (done) => {
            clientWithInvalidCredentials.authService.getToken()
                .then((token) => {
                    done(new Error('Promise should be rejected'));
                })
                .catch((err) => {
                    should.exist(err);
                    should.not.exist(TokenHandler.getTokenFromStorage());
                    done();
                });
        });
        it('tries to use an invalid token in a request that requires auth and then deletes it', (done) => {
            TokenHandler.storeToken(clientConstants.invalidToken);
            client.measurementService.create(measurementConstants.validMeasurementRequestWithThingInNYC)
                .then(() => {
                    done(new Error("Request should fail and return a 401 Unauthorized"));
                })
                .catch((err) => {
                    should.not.exist(TokenHandler.getTokenFromStorage());
                    done();
                });
        });
    });

    describe('POST /user/logIn 200', () => {
        it('gets a token for a valid user', (done) => {
            client.authService.getToken()
                .then((token) => {
                    token.should.be.equal(TokenHandler.getTokenFromStorage());
                    client.authService.getToken()
                        .then((token) => {
                            token.should.be.equal(TokenHandler.getTokenFromStorage());
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
        it('gets a token for a valid user and then deletes it', (done) => {
            client.authService.getToken()
                .then((token) => {
                    token.should.be.equal(TokenHandler.getTokenFromStorage());
                    TokenHandler.invalidateToken();
                    should.not.exist(TokenHandler.getTokenFromStorage());
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
    });
});