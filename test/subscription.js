import chai from './lib/chai';
import _ from 'underscore';
import server from './lib/iot-server/src/index';
import serverConfig from './lib/iot-server/src/config/index';
import { UserModel } from './lib/iot-server/src/models/user';
import { SubscriptionModel } from './lib/iot-server/src/models/subscription';
import { TokenHandler } from "../src/helpers/tokenHandler";
import IoTClient from '../src/index';
import authConstants from './lib/iot-server/test/constants/auth';
import subscriptionConstants from './lib/iot-server/test/constants/subscription';
import responseKeys from './lib/iot-server/src/utils/responseKeys';
import httpStatus from 'http-status';

const assert = chai.assert;
const should = chai.should();
const url = `http://localhost:${serverConfig.nodePort}`;
const basicAuthUsername = Object.keys(serverConfig.basicAuthUsers)[0];
const basicAuthPassword = serverConfig.basicAuthUsers[basicAuthUsername];
const username = authConstants.validUser.username;
const password = authConstants.validUser.password;
const client = new IoTClient({
    url,
    basicAuthUsername,
    basicAuthPassword,
    username,
    password
});
const clientWithInvalidCredentials = new IoTClient({
    url,
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
            const promise = clientWithInvalidCredentials.subscriptionService.subscribe(subscriptionConstants.validSubscription);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.UNAUTHORIZED)
                .and.notify(done);
        });
    });

    describe('POST /subscription 400', () => {
        it('tries to create an invalid subscription', (done) => {
            const promise = client.subscriptionService.subscribe(subscriptionConstants.invalidSubscription);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.BAD_REQUEST)
                .and.notify(done);
        });
    });

    describe('POST /subscription 409', () => {
        it('tries to recreate an already created subscription', (done) => {
            const promise = client.subscriptionService.subscribe(subscriptionConstants.validSubscription);
            promise
                .then(() => {
                    const promise = client.subscriptionService.subscribe(subscriptionConstants.validSubscription);
                    promise
                        .should.eventually.be.rejected
                        .and.have.property('statusCode', httpStatus.CONFLICT)
                        .and.notify(done);
                })
                .catch((err) => {
                    done(err)
                });
        });
    });

    describe('POST /subscription 201', () => {
        it('creates a subscription', (done) => {
            const promise = client.subscriptionService.subscribe(subscriptionConstants.validSubscription);
            promise
                .should.eventually.be.fulfilled
                .and.have.property('statusCode', httpStatus.CREATED)
                .and.notify(done);
        });
    });

    describe('DELETE /subscription 400', () => {
        it('tries to delete a subscription with an invalid subscription ID', (done) => {
            const promise = client.subscriptionService.unSubscribe(subscriptionConstants.invalidSubscriptionId);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.BAD_REQUEST)
                .and.notify(done);
        });
    });

    describe('DELETE /subscription 404', () => {
        it('tries to delete a subscription  with non existing with subscription ID', (done) => {
            const promise = client.subscriptionService.unSubscribe(subscriptionConstants.nonExistingSubscriptionId);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.NOT_FOUND)
                .and.notify(done);
        });
    });

    describe('DELETE /subscription 201', () => {
        it('deletes a subscription', (done) => {
            client.subscriptionService.subscribe(subscriptionConstants.validSubscription)
                .then((res) => {
                    const subscriptionId = res.body._id;
                    const promise = client.subscriptionService.unSubscribe(subscriptionId);
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

    describe('GET /subscriptions 400', () => {
        it('tries to get subscriptions but no chatId query param is specified', (done) => {
            const promise = client.subscriptionsService.getSubscriptionsByChat();
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.BAD_REQUEST)
                .and.notify(done);
        });
        it('tries to get subscriptions with an invalid chatId query param', (done) => {
            const promise = client.subscriptionsService.getSubscriptionsByChat(subscriptionConstants.invalidChatId);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.BAD_REQUEST)
                .and.notify(done);
        });
    });

    describe('GET /subscriptions 404', () => {
        it('tries to get subscriptions but no one has been created yet', (done) => {
            const promise = client.subscriptionsService.getSubscriptionsByChat(subscriptionConstants.validChatId);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.NOT_FOUND)
                .and.notify(done);
        });
    });

    describe('GET /subscriptions 200', () => {
        it('gets subscriptions', (done) => {
            const subscriptions = [
                subscriptionConstants.validSubscription,
                subscriptionConstants.validSubscription2,
                subscriptionConstants.validSubscription3
            ];
            const promises = _.map(subscriptions, (subscription) => {
                const newSubscription = new SubscriptionModel(subscription);
                return newSubscription.save();
            });
            Promise.all(promises)
                .then(() => {
                    client.subscriptionsService.getSubscriptionsByChat(subscriptionConstants.validChatId2)
                        .then((res) => {
                            res.should.have.property('statusCode', httpStatus.OK);
                            res.body[responseKeys.subscriptionsArrayKey].length.should.be.eql(2);
                            const subscriptionId = _.first(res.body[responseKeys.subscriptionsArrayKey])._id;

                            client.subscriptionService.unSubscribe(subscriptionId)
                                .then(() => {
                                    client.subscriptionsService.getSubscriptionsByChat(subscriptionConstants.validChatId)
                                        .then((res) => {
                                            res.should.have.property('statusCode', httpStatus.OK);
                                            res.body[responseKeys.subscriptionsArrayKey].length.should.be.eql(1);
                                            done();
                                        })
                                        .catch((err) => {
                                            done(err);
                                        });
                                })
                                .catch((err) => {
                                    done(err);
                                });
                        })
                        .catch((err) => {
                            done(err);
                        });
                })
                .catch((err) => {
                    done(err);
                })
        })
    });
});