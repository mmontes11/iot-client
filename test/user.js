import chai from '../lib/chai';
import server from '../iot_backend/index';
import IotClient from '../index';
import constants from './constants';

const assert = chai.assert;
const should = chai.should();
const client = new IotClient('http://localhost:8000', 'admin', 'admin');

describe('User', () => {

    describe('User service', () => {
        it('creates a user', (done) => {
            client.userService.createUser(constants.validUser).should.be.fulfilled;
            done();
        });
    });

    after((done) => {
        server.close((err) => {
            done(err);
        });
    });
});