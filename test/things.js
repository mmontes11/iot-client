import chai from './lib/chai';
import server from './lib/iot-backend/src/index';
import httpStatus from 'http-status';
import serverConfig from './lib/iot-backend/src/config/index';
import { UserModel } from './lib/iot-backend/src/models/user';
import { ThingModel } from './lib/iot-backend/src/models/thing';
import { TokenHandler } from "../src/helpers/tokenHandler";
import IoTClient from '../src/index';
import authConstants from './lib/iot-backend/test/constants/auth';
import measurementConstants from './lib/iot-backend/test/constants/measurement';

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
        Promise.all(promises)
            .then(() => {
                done();
            }).catch((err) => {
                done(err);
            });
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

    describe('POST /things 200', () => {
        beforeEach((done) => {
            const promises = [client.measurementService.create(measurementConstants.validMeasurementRequestWithThingInNYC),
                client.measurementService.create(measurementConstants.validMeasurementRequestWithThingInCoruna)];
            Promise.all(promises)
                .then(() => {
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        });
        it('gets available things', (done) => {
            const promise = client.thingsService.getThings();
            promise
                .then((result) => {
                    result.statusCode.should.be.equal(httpStatus.OK);
                    should.exist(result.body);
                    done();
                })
                .catch((err) => {
                    done(err);
                });
        })
    });
});