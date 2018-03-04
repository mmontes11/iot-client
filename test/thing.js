import chai from './lib/chai';
import _ from 'underscore';
import server from './lib/iot-backend/src/index';
import httpStatus from 'http-status';
import serverConfig from './lib/iot-backend/src/config/index';
import { UserModel } from './lib/iot-backend/src/models/user';
import { ThingModel } from './lib/iot-backend/src/models/thing';
import { TokenHandler } from "../src/helpers/tokenHandler";
import IoTClient from '../src/index';
import authConstants from './lib/iot-backend/test/constants/auth';
import thingConstants from './lib/iot-backend/test/constants/thing';

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

describe('Things', () => {

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

    before((done) => {
        const promises = [ThingModel.remove({})];
        ThingModel.remove({})
            .then(() => {
                const things = [
                    thingConstants.thingAtACoruna,
                    thingConstants.thingAtACoruna2,
                    thingConstants.thingAtNYC,
                    thingConstants.thingAtTokyo,
                    thingConstants.thingWithEvents,
                    thingConstants.thingWithEventsAndMeasurements,
                    thingConstants.thingWithEventsAndMeasurements2
                ];
                const promises = _.map(things, (thing) => {
                    const newThing = new ThingModel(thing);
                    return newThing.save();
                });
                Promise.all(promises)
                    .then(() => {
                        done();
                    })
                    .catch((err) => {
                        done(err);
                    });
            })
            .catch((err) => {
                done((err));
            })
    });

    describe('POST /things 401', () => {
        it('tries to get available things with invalid credentials', (done) => {
            const promise = clientWithInvalidCredentials.thingsService.getThings();
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.UNAUTHORIZED)
                .and.notify(done);
        })
    });

    describe('GET /things 200', () => {
        it('gets available things', (done) => {
            const promise = client.thingsService.getThings();
            promise
                .should.eventually.be.fulfilled
                .and.have.property('statusCode', httpStatus.OK)
                .and.notify(done);
        });
        it('gets things with supportsMeasurements = true and supportsEvents = false', (done) => {
            const promise = client.thingsService.getThings(true, false);
            promise
                .should.eventually.be.fulfilled
                .and.have.property('statusCode', httpStatus.OK)
                .and.notify(done);
        });
        it('gets things with supportsEvents = false', (done) => {
            const promise = client.thingsService.getThings(undefined, true);
            promise
                .should.eventually.be.fulfilled
                .and.have.property('statusCode', httpStatus.OK)
                .and.notify(done);
        });
        it('gets things with with supportsMeasurements = true and supportsEvents = true', (done) => {
            const promise = client.thingsService.getThings(true, true);
            promise
                .should.eventually.be.fulfilled
                .and.have.property('statusCode', httpStatus.OK)
                .and.notify(done);
        });
    });

    describe('GET /things 200', () => {
        it('gets available things', (done) => {
            const promise = client.thingsService.getThings();
            promise
                .should.eventually.be.fulfilled
                .and.have.property('statusCode', httpStatus.OK)
                .and.notify(done);
        });
    });

    describe('GET /things?supportsMeasurements=X&supportsEvents=X 404', () => {
        it('gets things with supportsMeasurements = true and supportsEvents = false', (done) => {
            const promise = client.thingsService.getThings(false, false);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.NOT_FOUND)
                .and.notify(done);
        });
    });

    describe('GET /things?supportsMeasurements=X&supportsEvents=X 200', () => {
        it('gets things with supportsMeasurements = true and supportsEvents = false', (done) => {
            const promise = client.thingsService.getThings(true, false);
            promise
                .should.eventually.be.fulfilled
                .and.have.property('statusCode', httpStatus.OK)
                .and.notify(done);
        });
        it('gets things with supportsEvents = false', (done) => {
            const promise = client.thingsService.getThings(undefined, true);
            promise
                .should.eventually.be.fulfilled
                .and.have.property('statusCode', httpStatus.OK)
                .and.notify(done);
        });
        it('gets things with with supportsMeasurements = true and supportsEvents = true', (done) => {
            const promise = client.thingsService.getThings(true, true);
            promise
                .should.eventually.be.fulfilled
                .and.have.property('statusCode', httpStatus.OK)
                .and.notify(done);
        });
    });
});