import chai from "./lib/chai";
import serverConfig from "./lib/iot-server/src/config/index";
import IoTClient from "../src/index";
import serverConstants from "./lib/iot-server/test/constants/auth";

const should = chai.should();
const url = `http://localhost:${serverConfig.nodePort}`;
const basicAuthUsername = Object.keys(serverConfig.basicAuthUsers)[0];
const basicAuthPassword = serverConfig.basicAuthUsers[basicAuthUsername];
const { username, password } = serverConstants.validUser;

describe("IoT Client", () => {
  describe("IoT Client initialization with error", () => {
    it("tries to create an instance of IoT Client with invalid params", done => {
      let iotClient;
      try {
        iotClient = new IoTClient({
          url,
        });
        should.exist(iotClient);
        done(new Error("IoT Client initialization with invalid params should fail"));
      } catch (err) {
        should.not.exist(iotClient);
        done();
      }
    });
  });

  describe("IoT Client successfully initialization", () => {
    it("creates an instance of IoT Client", done => {
      let iotClient;
      try {
        iotClient = new IoTClient({
          url,
          basicAuthUsername,
          basicAuthPassword,
          username,
          password,
        });
        should.exist(iotClient);
        done();
      } catch (err) {
        should.not.exist(iotClient);
        done(err);
      }
    });
  });
});
