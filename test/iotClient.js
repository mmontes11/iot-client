import chai from './lib/chai';
import serverConfig from './lib/iot-backend/src/config/index';
import IoTClient from '../src/index';
import serverConstants from './lib/iot-backend/test/constants/auth';

const assert = chai.assert;
const should = chai.should();
const host = `http://localhost:${serverConfig.nodePort}`;
const basicAuthUsername = Object.keys(serverConfig.basicAuthUsers)[0];
const basicAuthPassword = serverConfig.basicAuthUsers[basicAuthUsername];
const username = serverConstants.validUser.username;
const password = serverConstants.validUser.password;

describe('IoT Client', () => {

    describe('IoT Client initialization with error', () => {
        it('tries to create an instance of IoT Client with invalid params', (done) => {
             try {
                 new IoTClient({
                    host
                 });
                 done(new Error("IoT Client initialization with invalid params should fail"));
             } catch (err) {
                 done();
             }
        });
    });

    describe('IoT Client successfully initialization', () => {
        it('creates an instance of IoT Client', (done) => {
            try {
                new IoTClient({
                    host,
                    basicAuthUsername,
                    basicAuthPassword,
                    username,
                    password
                });
                done();
            } catch (err) {
                done(err);
            }
        });
    });
});