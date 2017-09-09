import chai from '../lib/chai';
import server from '../iot_backend/index';
import serverConfig from '../iot_backend/config/index';
import { UserModel } from '../iot_backend/src/models/db/user';
import IotClient from '../index';
import constants from './constants';
import httpStatus from 'http-status';

const assert = chai.assert;
const should = chai.should();
const host = `http://localhost:${serverConfig.nodePort}`;
const basicAuthUser = Object.keys(serverConfig.basicAuthUsers)[0];
const basicAuthPassword = serverConfig.basicAuthUsers[basicAuthUser];
const client = new IotClient({
    host,
    basicAuthUser,
    basicAuthPassword
});
const clientWithInvalidCredentials = new IotClient({
    host,
    basicAuthUser: 'foo',
    basicAuthPassword: 'bar'
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
            const promise = clientWithInvalidCredentials.userService.createUser(constants.validUser);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.UNAUTHORIZED)
                .and.notify(done);
        })
    });

    describe('POST /user 400', () => {
        it('tries to create an invalid user', (done) => {
            const promise = client.userService.createUser(constants.invalidUser);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.BAD_REQUEST)
                .and.notify(done);
        });
    });

    describe('POST /user 400', () => {
        it('tries to create a user with weak password', (done) => {
            const promise = client.userService.createUser(constants.userWithWeakPassword);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.BAD_REQUEST)
                .and.notify(done);
        });
    });

    describe('POST /user && POST /user', () => {
        it('creates the same user twice', (done) => {
            client.userService.createUser(constants.validUser)
                .then(() => {
                    const promise = client.userService.createUser(constants.validUser);
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

    describe('POST /user', () => {
        it('creates an user', (done) => {
            const promise = client.userService.createUser(constants.validUser);
            promise.should.eventually.be.fulfilled.notify(done);
        });
    });

    after((done) => {
        server.close((err) => {
            done(err);
        });
    });
});