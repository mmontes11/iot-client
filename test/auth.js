import httpStatus from "http-status";
import chai from "./lib/chai";
import serverConfig from "./lib/iot-server/src/config/index";
import { UserModel } from "./lib/iot-server/src/models/user";
import { TokenHandler } from "../src/helpers/tokenHandler";
import IoTClient from "../src/index";
import serverConstants from "./lib/iot-server/test/constants/auth";
import clientConstants from "./constants/auth";
import measurementConstants from "./lib/iot-server/test/constants/measurement";
import "./lib/iot-server/src/index";

const { assert } = chai;
const should = chai.should();
const url = `http://localhost:${serverConfig.nodePort}`;
const basicAuthUsername = Object.keys(serverConfig.basicAuthUsers)[0];
const basicAuthPassword = serverConfig.basicAuthUsers[basicAuthUsername];
const { username, password } = serverConstants.validUser;
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

describe("Auth", () => {
  beforeEach(async () => {
    await TokenHandler.invalidateToken();
    assert((await TokenHandler.getToken()) === undefined, "Token should be undefined");
    await UserModel.remove({});
    await client.authService.createUser(serverConstants.validUser);
  });

  describe("POST /auth 401", () => {
    it("tries to check auth with invalid credentials", done => {
      const promise = clientWithInvalidCredentials.authService.checkAuth(serverConstants.validUser);
      promise.should.eventually.be.rejected.and.have.property("statusCode", httpStatus.UNAUTHORIZED).and.notify(done);
    });
  });

  describe("POST /auth 401", () => {
    it("checks auth of an user with invalid credentials", done => {
      const promise = client.authService.checkAuth(serverConstants.invalidUser);
      promise.should.eventually.be.rejected.and.have.property("statusCode", httpStatus.UNAUTHORIZED).and.notify(done);
    });
  });

  describe("POST /auth 200", () => {
    it("checks auth of an user with valid credentials", done => {
      const promise = client.authService.checkAuth(serverConstants.validUser);
      promise.should.eventually.be.fulfilled.and.have.property("statusCode", httpStatus.OK).and.notify(done);
    });
  });

  describe("POST /auth/user 401", () => {
    it("tries to create user a user with invalid credentials", done => {
      const promise = clientWithInvalidCredentials.authService.createUser(serverConstants.validUser);
      promise.should.eventually.be.rejected.and.have.property("statusCode", httpStatus.UNAUTHORIZED).and.notify(done);
    });
  });

  describe("POST /auth/user 400", () => {
    it("tries to createUser an invalid user", done => {
      const promise = client.authService.createUser(serverConstants.invalidUser);
      promise.should.eventually.be.rejected.and.have.property("statusCode", httpStatus.BAD_REQUEST).and.notify(done);
    });
    it("tries to createUser a user with weak password", done => {
      const promise = client.authService.createUser(serverConstants.userWithWeakPassword);
      promise.should.eventually.be.rejected.and.have.property("statusCode", httpStatus.BAD_REQUEST).and.notify(done);
    });
  });

  describe("POST /auth/user 409", () => {
    it("creates the same user twice", done => {
      UserModel.remove({}, err => {
        assert(err !== undefined, "Error cleaning MongoDB for tests");
        client.authService
          .createUser(serverConstants.validUser)
          .then(() => {
            const promise = client.authService.createUser(serverConstants.validUser);
            promise.should.eventually.be.rejected.and.have.property("statusCode", httpStatus.CONFLICT).and.notify(done);
          })
          .catch(authErr => {
            done(authErr);
          });
      });
    });
  });

  describe("POST /auth/user 200", () => {
    it("creates a user", done => {
      UserModel.remove({}, err => {
        assert(err !== undefined, "Error cleaning MongoDB for tests");
        const promise = client.authService.createUser(serverConstants.validUser);
        promise.should.eventually.be.fulfilled.and.have.property("statusCode", httpStatus.CREATED).and.notify(done);
      });
    });
  });

  describe("POST /auth/token 401", () => {
    it("tries to get a token with a non existing user", done => {
      const promise = clientWithInvalidCredentials.authService.getToken();
      promise.should.eventually.be.rejected.and.have.property("statusCode", httpStatus.UNAUTHORIZED).and.notify(done);
    });
    it("tries to get a token with an user with invalid credentials", async () => {
      try {
        await clientWithInvalidCredentials.authService.getToken();
        assert(false, "Request should fail and return a 401 Unauthorized");
      } catch (err) {
        should.exist(err);
        should.not.exist(await TokenHandler.getToken());
      }
    });
    it("tries to use an invalid token in a request that requires auth and then deletes it", async () => {
      await TokenHandler.storeToken(clientConstants.invalidToken);
      try {
        await client.measurementService.create(measurementConstants.validMeasurementRequestWithThingInNYC);
        assert(false, "Request should fail and return a 401 Unauthorized");
      } catch (err) {
        should.exist(err);
        should.not.exist(await TokenHandler.getToken());
      }
    });
  });

  describe("POST /auth/token 200", () => {
    it("gets a token for a valid user", async () => {
      const token = await client.authService.getToken();
      token.should.be.equal(await TokenHandler.getToken());
    });
    it("gets a token for a valid user and then deletes it", async () => {
      const token = await client.authService.getToken();
      token.should.be.equal(await TokenHandler.getToken());
      await TokenHandler.invalidateToken();
      should.not.exist(await TokenHandler.getToken());
    });
  });
});
