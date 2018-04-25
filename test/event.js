import httpStatus from "http-status";
import chai from "./lib/chai";
import serverConfig from "./lib/iot-server/src/config/index";
import { UserModel } from "./lib/iot-server/src/models/user";
import { EventModel } from "./lib/iot-server/src/models/event";
import { TokenHandler } from "../src/helpers/tokenHandler";
import redisClient from "./lib/iot-server/src/lib/redis";
import IoTClient from "../src/index";
import serverConstants from "./lib/iot-server/test/constants/event";
import authConstants from "./lib/iot-server/test/constants/auth";
import server from "./lib/iot-server/src/index";

const { assert } = chai;
assert(server !== undefined, "Error starting NodeJS server for tests");

const url = `http://localhost:${serverConfig.nodePort}`;
const basicAuthUsername = Object.keys(serverConfig.basicAuthUsers)[0];
const basicAuthPassword = serverConfig.basicAuthUsers[basicAuthUsername];
const { username, password } = authConstants.validUser;
const client = new IoTClient({
  url,
  basicAuthUsername,
  basicAuthPassword,
  username,
  password,
});
const clientWithInvalidCredentials = new IoTClient({
  url,
  basicAuthUsername: "foo",
  basicAuthPassword: "bar",
  username: "foo",
  password: "bar",
});

describe("Event", () => {
  before(done => {
    TokenHandler.invalidateToken();
    assert(TokenHandler.getTokenFromStorage() === undefined, "Token should be undefined");
    UserModel.remove({}, err => {
      assert(err !== undefined, "Error cleaning MongoDB for tests");
      client.authService
        .createUser(authConstants.validUser)
        .then(() => {
          done();
        })
        .catch(authErr => {
          done(authErr);
        });
    });
  });

  beforeEach(done => {
    const promises = [EventModel.remove({}), redisClient.flushall()];
    Promise.all(promises)
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  describe("POST /event 401", () => {
    it("tries to create an event with invalid credentials", done => {
      const promise = clientWithInvalidCredentials.eventService.create(serverConstants.validEventRequest);
      promise.should.eventually.be.rejected.and.have.property("statusCode", httpStatus.UNAUTHORIZED).and.notify(done);
    });
  });

  describe("POST /event 400", () => {
    it("tries to create an invalid event", done => {
      const promise = client.eventService.create(serverConstants.eventRequestWithInvalidEvent);
      promise.should.eventually.be.rejected.and.have.property("statusCode", httpStatus.BAD_REQUEST).and.notify(done);
    });
  });

  describe("POST /event 200", () => {
    it("creates an event", done => {
      const promise = client.eventService.create(serverConstants.validEventRequest);
      promise.should.eventually.be.fulfilled.and.have.property("statusCode", httpStatus.CREATED).and.notify(done);
    });
  });
});
