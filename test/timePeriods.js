import chai from './lib/chai';
import server from './lib/iot-backend/src/index';
import httpStatus from 'http-status';
import serverConfig from './lib/iot-backend/src/config/index';
import { UserModel } from './lib/iot-backend/src/models/user';
import { TokenHandler } from "../src/helpers/tokenHandler";
import IoTClient from '../src/index';
import authConstants from './lib/iot-backend/test/constants/auth';

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

describe('TimePeriod', () => {

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

    describe('POST /timePeriods 401', () => {
        it('tries to get supported time periods with invalid credentials', (done) => {
            const promise = clientWithInvalidCredentials.timePeriodsService.getSupportedTimePeriods();
            promise
                .should.eventually.be.rejected
                .and.have.property('statusCode', httpStatus.UNAUTHORIZED)
                .and.notify(done);
        })
    });

    describe('POST /timePeriods 200', () => {
        it('gets supported time periods', (done) => {
            const promise = client.timePeriodsService.getSupportedTimePeriods();
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