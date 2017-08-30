import chai from '../lib/chai';
import server from '../iot_backend/index';

const assert = chai.assert;
const should = chai.should();

describe('User', () => {

    describe('Test', () => {
        it('A dummy initial test', (done) => {
            done();
        });
    });

    after((done) => {
        server.close((err) => {
            done(err);
        });
    });
});