import chai from './lib/chai';
import server from './lib/iot_backend/src/index';
import serverConfig from './lib/iot_backend/src/config/index';
import { UserModel } from './lib/iot_backend/src/models/db/user';
import IotClient from '../src/index';
import observationConstants from './lib/iot_backend/test/constants/observations';
import userConstants from './lib/iot_backend/test/constants/user';
import thingConstants from './lib/iot_backend/test/constants/thing';
import httpStatus from 'http-status';

const assert = chai.assert;
const should = chai.should();
const host = `http://localhost:${serverConfig.nodePort}`;
const basicAuthUsername = Object.keys(serverConfig.basicAuthUsers)[0];
const basicAuthPassword = serverConfig.basicAuthUsers[basicAuthUsername];
const username = userConstants.validUser.username;
const password = userConstants.validUser.password;
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


describe('Measurement', () => {

    before((done) => {
        client.authService.invalidateToken();
        assert(client.authService.getTokenFromStorage() === undefined, 'Token should be undefined');
        UserModel.remove({}, (err) => {
            assert(err !== undefined, 'Error cleaning MongoDB for tests');
            client.userService.create(userConstants.validUser)
                .then(() => {
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
    });

    describe('POST /observations 401', () => {
        it('tries to create observations with invalid credentials', (done) => {
            const promise = clientWithInvalidCredentials.observationsService.create(observationConstants.temperatureMeasurement);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.UNAUTHORIZED)
                .and.notify(done);
        });
    });

    describe('POST /observations 304', () => {
        it('tries to create observations using an empty array', (done) => {
            const emptyObservations = {
                observations: []
            };
            const promise = client.observationsService.create(emptyObservations);
            promise
                .should.eventually.be.fulfilled
                .and.have.property('statusCode', httpStatus.NOT_MODIFIED)
                .and.notify(done);
        });
    });

    describe('POST /observations 400', () => {
        it('tries to create observations using an invalid payload', (done) => {
            const invalidPayload = {
                foo: []
            };
            const promise = client.observationsService.create(invalidPayload);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.BAD_REQUEST)
                .and.notify(done);
        });
        it('tries to create invalid observations', (done) => {
            const invalidObservations = {
                observations: [
                    observationConstants.invalidMeasurementWithKind,
                    observationConstants.validMeasurementWithInvalidKind,
                    observationConstants.invalidEventWithKind,
                    observationConstants.validEventWithInvalidKind
                ]
            };
            const promise = client.observationsService.create(invalidObservations);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.BAD_REQUEST)
                .and.notify(done);
        });
    });

    describe('POST /observations 201', () => {
        it('creates observations', (done) => {
            const validObservations = {
                observations: [
                    observationConstants.validMeasurementWithKind,
                    observationConstants.validEventWithKind
                ],
                thing: thingConstants.thingAtNYC
            };
            const promise = client.observationsService.create(validObservations);
            promise
                .should.eventually.be.fulfilled
                .and.have.property('statusCode', httpStatus.CREATED)
                .and.notify(done);
        });
    });

    describe('POST /observations 207', () => {
        it('creates observations and also tries to create invalid ones', (done) => {
            const measurements = [
                observationConstants.validMeasurementWithKind,
                observationConstants.validMeasurementWithInvalidKind,
                observationConstants.invalidMeasurementWithKind
            ];
            const events = [
                observationConstants.validEventWithKind,
                observationConstants.validEventWithInvalidKind,
                observationConstants.invalidEventWithKind
            ];
            const validAndInvalidObservations = {
                observations: [
                    ...measurements,
                    ...events
                ],
                thing: thingConstants.thingAtNYC
            };
            console.log(validAndInvalidObservations);
            const promise = client.observationsService.create(validAndInvalidObservations);
            promise
                .should.eventually.be.fulfilled
                .and.have.property('statusCode', httpStatus.MULTI_STATUS)
                .and.notify(done);
        });
    });
});