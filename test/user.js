import chai from '../lib/chai';
import server from '../iot_backend/index';
import serverConfig from '../iot_backend/config/index';
import { UserModel } from '../iot_backend/src/models/db/user';
import IotClient from '../index';
import constants from './constants';

const assert = chai.assert;
const should = chai.should();
const basicAuthUser = Object.keys(serverConfig.basicAuthUsers)[0];
const basicAuthPassword = serverConfig.basicAuthUsers[basicAuthUser];
const client = new IotClient(`http://localhost:${serverConfig.nodePort}`, basicAuthUser, basicAuthPassword);
const clientWithInvalidCredentials = new IotClient(`http://localhost:${serverConfig.nodePort}`, 'foo', 'bar');

describe('User', () => {

    beforeEach((done) => {
        UserModel.remove({}, (err) => {
            assert(err !== undefined, 'Error cleaning MongoDB for tests');
            done();
        });
    });

    describe('POST /user', () => {
        it('creates an user', (done) => {
            client.userService.createUser(constants.validUser).should.be.fulfilled.notify(done);
        });
    });

    after((done) => {
        server.close((err) => {
            done(err);
        });
    });
});