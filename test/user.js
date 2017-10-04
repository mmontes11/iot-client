import chai from '../lib/chai';
import server from './iot_backend/index';
import serverConfig from './iot_backend/config/index';
import { UserModel } from './iot_backend/src/models/db/user';
import IotClient from '../index';
import constants from './iot_backend/test/constants';
import httpStatus from 'http-status';

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


describe('User', () => {

    beforeEach((done) => {
        UserModel.remove({}, (err) => {
            assert(err !== undefined, 'Error cleaning MongoDB for tests');
            done();
        });
    });

    describe('POST /user 401', () => {
        it('tries to create a user with invalid credentials', (done) => {
            const promise = clientWithInvalidCredentials.userService.create(constants.validUser);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.UNAUTHORIZED)
                .and.notify(done);
        })
    });

    describe('POST /user 400', () => {
        it('tries to create an invalid user', (done) => {
            const promise = client.userService.create(constants.invalidUser);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.BAD_REQUEST)
                .and.notify(done);
        });
    });

    describe('POST /user 400', () => {
        it('tries to create a user with weak password', (done) => {
            const promise = client.userService.create(constants.userWithWeakPassword);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.BAD_REQUEST)
                .and.notify(done);
        });
    });

    describe('POST /user && POST /user', () => {
        it('creates the same user twice', (done) => {
            client.userService.create(constants.validUser)
                .then(() => {
                    const promise = client.userService.create(constants.validUser);
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

    describe('POST /user && POST /user/logIn', () => {
        it('creates a user and logs in', (done) => {
            client.userService.create(constants.validUser)
                .then(() => {
                    const promise = client.userService.logIn();
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

    describe('POST /user/logIn', () => {
        it('tries to log in with a non existing user', (done) => {
            const promise = clientWithInvalidCredentials.userService.logIn();
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.UNAUTHORIZED)
                .and.notify(done);
        });
    });

});
