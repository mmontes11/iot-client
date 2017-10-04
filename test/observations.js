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


describe('Measurement', () => {

    before((done) => {
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

    describe('POST /observations 401', () => {
        it('tries to create observations with invalid credentials', (done) => {
            const promise = clientWithInvalidCredentials.observationsService.create(constants.temperatureMeasurement);
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
                    constants.invalidMeasurementWithKind,
                    constants.validMeasurementWithInvalidKind,
                    constants.invalidEventWithKind,
                    constants.validEventWithInvalidKind
                ]
            };
            const promise = client.observationsService.create(invalidObservations);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.BAD_REQUEST)
                .and.notify(done);
        });
    });

    describe('POST /observations 207', () => {
        it('creates observations and also tries to create invalid ones', (done) => {
            const measurements = [
                constants.validMeasurementWithKind,
                constants.validMeasurementWithInvalidKind,
                constants.invalidMeasurementWithKind
            ];
            const events = [
                constants.validEventWithKind,
                constants.validEventWithInvalidKind,
                constants.invalidEventWithKind
            ];
            const validAndInvalidObservations = {
                observations: [
                    ...measurements,
                    ...events
                ]
            };
            const promise = client.observationsService.create(validAndInvalidObservations);
            promise
                .should.eventually.be.fulfilled
                .and.have.property('statusCode', httpStatus.MULTI_STATUS)
                .and.notify(done);
        });
    });

    describe('POST /observations 201', () => {
        it('creates observations', (done) => {
            const validObservations = {
                observations: [
                    constants.validMeasurementWithKind,
                    constants.validEventWithKind
                ]
            };
            const promise = client.observationsService.create(validObservations);
            promise
                .should.eventually.be.fulfilled
                .and.have.property('statusCode', httpStatus.CREATED)
                .and.notify(done);
        });
    });
});