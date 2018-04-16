import chai from './lib/chai';
import server from './lib/iot-server/src/index';
import httpStatus from 'http-status';
import serverConfig from './lib/iot-server/src/config/index';
import { UserModel } from './lib/iot-server/src/models/user';
import { MeasurementModel } from './lib/iot-server/src/models/measurement';
import { TokenHandler } from "../src/helpers/tokenHandler";
import redisClient from './lib/iot-server/src/lib/redis';
import IoTClient from '../src/index';
import serverConstants from './lib/iot-server/test/constants/measurement';
import clientConstants from './constants/measurement';
import authConstants from './lib/iot-server/test/constants/auth';

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


describe('Measurement', () => {

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
        const promises = [MeasurementModel.remove({}), redisClient.flushall()];
        Promise.all(promises)
            .then(() => {
                done();
            }).catch((err) => {
                done(err);
            });
    });

    describe('POST /measurement 401', () => {
        it('tries to create a measurement with invalid credentials', (done) => {
            const promise = clientWithInvalidCredentials.measurementService.create(serverConstants.temperatureMeasurement);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.UNAUTHORIZED)
                .and.notify(done);
        });
    });

    describe('GET /measurement/stats 401', () => {
        it('tries to get stats with invalid credentials', (done) => {
            const promise = clientWithInvalidCredentials.measurementService.getStats();
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.UNAUTHORIZED)
                .and.notify(done);
        });
    });

    describe('POST /measurement 400', () => {
        it('tries to create an invalid measurement', (done) => {
            const promise = client.measurementService.create(serverConstants.invalidMeasurementRequest);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.BAD_REQUEST)
                .and.notify(done);
        });
    });

    describe('POST /measurement 200', () => {
        it('creates a measurement', (done) => {
            const promise = client.measurementService.create(serverConstants.validMeasurementRequestWithThingInNYC);
            promise
                 .should.eventually.be.fulfilled
                 .and.have.property('statusCode', httpStatus.CREATED)
                 .and.notify(done);
        });
    });

    describe('GET /measurement/stats?startDate=X&endDate=Y 400', () => {
        it('gets stats by a bad specified date range', (done) => {
            const startDate = new Date();
            startDate.setHours(startDate.getHours() + 10);
            const endDate = new Date();
            endDate.setHours(endDate.getHours() + 5);
            const promise = client.measurementService.getStats({
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            });
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.BAD_REQUEST)
                .and.notify(done);
        });
    });

    describe('GET /measurement/stats 404', () => {
        it('gets stats but no measurements have been created', (done) => {
            const promise = client.measurementService.getStats();
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.NOT_FOUND)
                .and.notify(done);
        });
    });

    describe('GET /measurement/stats?queryParam=X 404', () => {
        beforeEach((done) => {
            const promises = [client.measurementService.create(serverConstants.validMeasurementRequestWithThingInNYC),
                client.measurementService.create(serverConstants.validMeasurementRequestWithThingInCoruna)];
            Promise.all(promises)
                .then(() => {
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
        it('gets stats by type but no one is available', (done) => {
            const promise = client.measurementService.getStatsByType(clientConstants.notAvailableType);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.NOT_FOUND)
                .and.notify(done);
        });
        it('gets stats by thing but no one is available', (done) => {
            const promise = client.measurementService.getStatsByThing(clientConstants.notAvailableThing);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.NOT_FOUND)
                .and.notify(done);
        });
        it('gets stats by date range but no one is available', (done) => {
            const startDate = new Date();
            startDate.setHours(startDate.getHours() + 5);
            const endDate = new Date();
            endDate.setHours(endDate.getHours() + 10);
            const promise = client.measurementService.getStatsByDateRange(startDate.toISOString(), endDate.toISOString());
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.NOT_FOUND)
                .and.notify(done);
        });
        it('gets stats by coordinates but no one is available', (done) => {
            const promise = client.measurementService.getStatsByCoordinates(clientConstants.notAvailableCoordinates.longitude, clientConstants.notAvailableCoordinates.latitude, 100);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.NOT_FOUND)
                .and.notify(done);
        });
        it('gets stats by address but no one is available', (done) => {
            const promise = client.measurementService.getStatsByAddress(clientConstants.notAvailableAddress, 100);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.NOT_FOUND)
                .and.notify(done);
        });
    });

    describe('GET /measurement/stats 200', () => {
        beforeEach((done) => {
            const promises = [client.measurementService.create(serverConstants.validMeasurementRequestWithThingInNYC),
                client.measurementService.create(serverConstants.validMeasurementRequestWithThingInCoruna)];
            Promise.all(promises)
                .then(() => {
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
        it('gets stats', (done) => {
            const promise = client.measurementService.getStats();
            promise
                .then((result) => {
                    result.statusCode.should.be.equal(httpStatus.OK);
                    should.exist(result.body);
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
    })

    describe('GET /measurement/stats?queryParam=X 200', () => {
        beforeEach((done) => {
            const promises = [client.measurementService.create(serverConstants.validMeasurementRequestWithThingInNYC),
                client.measurementService.create(serverConstants.validMeasurementRequestWithThingInCoruna)];
            Promise.all(promises)
                .then(() => {
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
        it('gets stats by type', (done) => {
            const promise = client.measurementService.getStatsByType(clientConstants.availableType);
            promise
                .then((result) => {
                    result.statusCode.should.be.equal(httpStatus.OK);
                    should.exist(result.body);
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
        it('gets stats by thing', (done) => {
            const promise = client.measurementService.getStatsByThing(clientConstants.availableThing);
            promise
                .then((result) => {
                    result.statusCode.should.be.equal(httpStatus.OK);
                    should.exist(result.body);
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
        it('gets stats by date', (done) => {
            const startDate = new Date();
            startDate.setHours(startDate.getHours() - 5);
            const endDate = new Date();
            endDate.setHours(endDate.getHours() + 10);
            const promise = client.measurementService.getStatsByDateRange(startDate.toISOString(), endDate.toISOString());
            promise
                .then((result) => {
                    result.statusCode.should.be.equal(httpStatus.OK);
                    should.exist(result.body);
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
    })
});