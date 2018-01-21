import chai from './lib/chai';
import server from './lib/iot-backend/src/index';
import serverConfig from './lib/iot-backend/src/config/index';
import { UserModel } from './lib/iot-backend/src/models/db/user';
import IotClient from '../src/index';
import measurementConstants from './lib/iot-backend/test/constants/measurement';
import userConstants from './lib/iot-backend/test/constants/user';
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
            assert(err !== undefined, 'Error cleaning MongoDB for tests')
            client.userService.create(userConstants.validUser)
                .then(() => {
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
    });

    describe('POST /measurement 401', () => {
        it('tries to create a measurement with invalid credentials', (done) => {
            const promise = clientWithInvalidCredentials.measurementService.create(measurementConstants.temperatureMeasurement);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.UNAUTHORIZED)
                .and.notify(done);
        });
    });

    describe('POST /measurement 400', () => {
        it('tries to create a an invalid measurement', (done) => {
            const promise = client.measurementService.create(measurementConstants.invalidMeasurementRequest);
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.BAD_REQUEST)
                .and.notify(done);
        });
    });

    describe('POST /measurement', () => {
        it('creates a measurement', (done) => {
            const promise = client.measurementService.create(measurementConstants.validMeasurementRequestWithThingInNYC);
             promise
                 .should.eventually.be.fulfilled
                 .and.have.property('statusCode', httpStatus.CREATED)
                 .and.notify(done);
        });
    });
});