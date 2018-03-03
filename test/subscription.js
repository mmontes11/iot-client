import chai from './lib/chai';
import server from './lib/iot-backend/src/index';
import serverConfig from './lib/iot-backend/src/config/index';
import { UserModel } from './lib/iot-backend/src/models/user';
import { SubscriptionModel } from './lib/iot-backend/src/models/subscription';
import { TokenHandler } from "../src/helpers/tokenHandler";
import IoTClient from '../src/index';
import authConstants from './lib/iot-backend/test/constants/auth';
import subscriptionConstants from './lib/iot-backend/test/constants/subscription';
import httpStatus from 'http-status';

const assert = chai.assert;
const should = chai.should();
const host = `http://localhost:${serverConfig.nodePort}`;
const basicAuthUsername = Object.keys(serverConfig.basicAuthUsers)[0];
const basicAuthPassword = serverConfig.basicAuthUsers[basicAuthUsername];
const username = authConstants.validUser.username;
const password = authConstants.validUser.password;
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


describe('Subscription', () => {

    before((done) => {
        TokenHandler.invalidateToken();
        assert(TokenHandler.getTokenFromStorage() === undefined, 'Token should be undefined');
        UserModel.remove({}, (err) => {
            assert(err !== undefined, 'Error cleaning MongoDB for tests');
            client.authService.createUser(authConstants.validUser)
                .then(() => {
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
    });

    beforeEach((done) => {
        const promises = [SubscriptionModel.remove({})];
        Promise.all(promises)
            .then(() => {
                done();
            }).catch((err) => {
                done(err);
            });
    });

    describe('POST /subscription 401', () => {
        it('tries to create a subscription with invalid credentials', (done) => {
            const promise = clientWithInvalidCredentials.subscriptionService.create(subscriptionConstants.validSubscription);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.UNAUTHORIZED)
                .and.notify(done);
        });
    });

    describe('POST /subscription 400', () => {
        it('tries to create an invalid subscription', (done) => {
            const promise = client.subscriptionService.create(subscriptionConstants.invalidSubscription);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.BAD_REQUEST)
                .and.notify(done);
        });
    });

    describe('POST /subscription 304', () => {
        it('tries to recreate an already created subscription', (done) => {
            const promise = client.subscriptionService.create(subscriptionConstants.validSubscription);
            promise
                .then(() => {
                    const promise = client.subscriptionService.create(subscriptionConstants.validSubscription);
                    promise
                        .should.eventually.be.fulfilled
                        .and.have.property('statusCode', httpStatus.NOT_MODIFIED)
                        .and.notify(done);
                })
                .catch((err) => {
                    done(err)
                });
        });
    });

    describe('POST /subscription 201', () => {
        it('creates a subscription', (done) => {
            const promise = client.subscriptionService.create(subscriptionConstants.validSubscription);
            promise
                .should.eventually.be.fulfilled
                .and.have.property('statusCode', httpStatus.CREATED)
                .and.notify(done);
        });
    });
});