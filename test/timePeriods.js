import chai from './lib/chai';
import server from './lib/iot-backend/src/index';
import httpStatus from 'http-status';
import serverConfig from './lib/iot-backend/src/config/index';
import { UserModel } from './lib/iot-backend/src/models/user';
import { AuthService } from "../src/services/authService";
import IotClient from '../src/index';
import userConstants from './lib/iot-backend/test/constants/user';

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

describe('Auth', () => {

    before((done) => {
        AuthService.invalidateToken();
        assert(AuthService.getTokenFromStorage() === undefined, 'Token should be undefined');
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

    describe('POST /timePeriods 401', () => {
        it('gets supported time periods', (done) => {
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