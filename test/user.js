import chai from './lib/chai';
import server from './lib/iot-backend/src/index';
import serverConfig from './lib/iot-backend/src/config/index';
import { UserModel } from './lib/iot-backend/src/models/user';
import IoTClient from '../src/index';
import constants from './lib/iot-backend/test/constants/user';
import httpStatus from 'http-status';

const assert = chai.assert;
const should = chai.should();
const host = `http://localhost:${serverConfig.nodePort}`;
const basicAuthUsername = Object.keys(serverConfig.basicAuthUsers)[0];
const basicAuthPassword = serverConfig.basicAuthUsers[basicAuthUsername];
const username = constants.validUser.username;
const password = constants.validUser.password;
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


describe('User', () => {

    beforeEach((done) => {
        UserModel.remove({}, (err) => {
            assert(err !== undefined, 'Error cleaning MongoDB for tests');
            done();
        });
    });

    describe('POST /user 401', () => {
        it('tries to createUser a user with invalid credentials', (done) => {
            const promise = clientWithInvalidCredentials.authService.createUser(constants.validUser);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.UNAUTHORIZED)
                .and.notify(done);
        })
    });

    describe('POST /user 400', () => {
        it('tries to createUser an invalid user', (done) => {
            const promise = client.authService.createUser(constants.invalidUser);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.BAD_REQUEST)
                .and.notify(done);
        });
    });

    describe('POST /user 400', () => {
        it('tries to createUser a user with weak password', (done) => {
            const promise = client.authService.createUser(constants.userWithWeakPassword);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.BAD_REQUEST)
                .and.notify(done);
        });
    });

    describe('POST /user && POST /user', () => {
        it('creates the same user twice', (done) => {
            client.authService.createUser(constants.validUser)
                .then(() => {
                    const promise = client.authService.createUser(constants.validUser);
                    promise
                        .should.eventually.be.rejected
                        .and.have.property('statusCode', httpStatus.CONFLICT)
                        .and.notify(done);
                })
                .catch((err) => {
                    done(err);
                })
        });
    });

    describe('POST /user && POST /user/getToken', () => {
        it('creates a user and logs in', (done) => {
            client.authService.createUser(constants.validUser)
                .then(() => {
                    const promise = client.authService.getToken();
                    promise
                        .should.eventually.be.fulfilled
                        .and.have.property('statusCode', httpStatus.OK)
                        .and.notify(done);
                })
                .catch((err) => {
                    done(err);
                })
        });
    });

    describe('POST /user/getToken', () => {
        it('tries to log in with a non existing user', (done) => {
            const promise = clientWithInvalidCredentials.authService.getToken();
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.UNAUTHORIZED)
                .and.notify(done);
        });
    });

});
