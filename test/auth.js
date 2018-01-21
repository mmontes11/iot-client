import chai from './lib/chai';
import server from './lib/iot-backend/src/index';
import serverConfig from './lib/iot-backend/src/config/index';
import { UserModel } from './lib/iot-backend/src/models/db/user';
import IotClient from '../src/index';
import constants from './lib/iot-backend/test/constants/user';
import defaultOptions from '../src/config/defaultOptions'

const assert = chai.assert;
const should = chai.should();
const host = `http://localhost:${serverConfig.nodePort}`;
const basicAuthUsername = Object.keys(serverConfig.basicAuthUsers)[0];
const basicAuthPassword = serverConfig.basicAuthUsers[basicAuthUsername];
const username = constants.validUser.username;
const password = constants.validUser.password;
const client = new IotClient({
    host,
    basicAuthUsername,
    basicAuthPassword,
    username,
    password
});
const clientWithInvalidCredentials = new IotClient({
    host,
    basicAuthUsername: 'foo',
    basicAuthPassword: 'bar',
    username: 'foo',
    password: 'bar'
});

describe('Auth', () => {

    beforeEach((done) => {
        client.authService.invalidateToken();
        assert(client.authService.getTokenFromStorage() === undefined, 'Token should be undefined');
        UserModel.remove({}, (err) => {
            assert(err !== undefined, 'Error cleaning MongoDB for tests');
            client.userService.create(constants.validUser)
                .then(() => {
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
    });

    it('gets a token for an user with invalid credentials', (done) => {
        clientWithInvalidCredentials.authService.getToken()
            .then((token) => {
                done(new Error('Promise should be rejected'));
            })
            .catch((err) => {
                should.exist(err);
                should.not.exist(clientWithInvalidCredentials.authService.getTokenFromStorage());
                done();
            });
    });

    it('gets a token for a valid user', (done) => {
        client.authService.getToken()
            .then((token) => {
                token.should.be.equal(client.authService.getTokenFromStorage());
                client.authService.getToken()
                    .then((token) => {
                        token.should.be.equal(client.authService.getTokenFromStorage());
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
        client.authService.getToken()
            .then((token) => {
                token.should.be.equal(client.authService.getTokenFromStorage());
                client.authService.invalidateToken();
                should.not.exist(client.authService.getTokenFromStorage());
                done();
            })
            .catch((err) => {
                done(err);
            });
    });
});