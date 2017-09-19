import chai from '../lib/chai';
import server from '../iot_backend/index';
import serverConfig from '../iot_backend/config/index';
import { UserModel } from '../iot_backend/src/models/db/user';
import IotClient from '../index';
import constants from './constants';
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


describe('User', () => {

    before((done) => {
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

    describe('POST /measurement', () => {
        it('creates a measurement', (done) => {
            const promise = client.measurementService.create(constants.temperatureMeasurement);
            promise
                .should.eventually.be.fulfilled
                .and.notify(done);
        });
    });
});