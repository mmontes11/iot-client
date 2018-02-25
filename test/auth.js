import chai from './lib/chai';
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

    it('gets a token for an user with invalid credentials', (done) => {
        clientWithInvalidCredentials.tokenHandler.getToken()
            .then((token) => {
                done(new Error('Promise should be rejected'));
            })
            .catch((err) => {
                should.exist(err);
                should.not.exist(TokenHandler.getTokenFromStorage());
                done();
            });
    });

    it('gets a token for a valid user', (done) => {
        client.tokenHandler.getToken()
            .then((token) => {
                token.should.be.equal(TokenHandler.getTokenFromStorage());
                client.tokenHandler.getToken()
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

    it('gets a token for a valid user and deletes it', (done) => {
        client.tokenHandler.getToken()
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