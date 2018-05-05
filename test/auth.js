import httpStatus from "http-status";
import chai from "./lib/chai";
import serverConfig from "./lib/iot-server/src/config/index";
import { UserModel } from "./lib/iot-server/src/models/user";
import { TokenHandler } from "../src/helpers/tokenHandler";
import IoTClient from "../src/index";
import serverConstants from "./lib/iot-server/test/constants/auth";
import clientConstants from "./constants/auth";
import measurementConstants from "./lib/iot-server/test/constants/measurement";
import server from "./lib/iot-server/src/index";

const { assert } = chai;
assert(server !== undefined, "Error starting NodeJS server for tests");

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
  beforeEach(done => {
    TokenHandler.invalidateToken();
    assert(TokenHandler.getTokenFromStorage() === undefined, "Token should be undefined");
    UserModel.remove({}, err => {
      assert(err !== undefined, "Error cleaning MongoDB for tests");
      client.authService
        .createUser(serverConstants.validUser)
        .then(() => {
          done();
        })
        .catch(authErr => {
          done(authErr);
        });
    });
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
    it("tries to get a token with an user with invalid credentials", done => {
      clientWithInvalidCredentials.authService
        .getToken()
        .then(() => {
          done(new Error("Promise should be rejected"));
        })
        .catch(err => {
          should.exist(err);
          should.not.exist(TokenHandler.getTokenFromStorage());
          done();
        });
    });
    it("tries to use an invalid token in a request that requires auth and then deletes it", done => {
      TokenHandler.storeToken(clientConstants.invalidToken);
      client.measurementService
        .create(measurementConstants.validMeasurementRequestWithThingInNYC)
        .then(() => {
          done(new Error("Request should fail and return a 401 Unauthorized"));
        })
        .catch(() => {
          should.not.exist(TokenHandler.getTokenFromStorage());
          done();
        });
    });
  });

  describe("POST /auth/token 200", () => {
    it("gets a token for a valid user", done => {
      client.authService
        .getToken()
        .then(token => {
          token.should.be.equal(TokenHandler.getTokenFromStorage());
          client.authService
            .getToken()
            .then(innerToken => {
              innerToken.should.be.equal(TokenHandler.getTokenFromStorage());
              done();
            })
            .catch(err => {
              done(err);
            });
        })
        .catch(err => {
          done(err);
        });
    });
    it("gets a token for a valid user and then deletes it", done => {
      client.authService
        .getToken()
        .then(token => {
          token.should.be.equal(TokenHandler.getTokenFromStorage());
          TokenHandler.invalidateToken();
          should.not.exist(TokenHandler.getTokenFromStorage());
          done();
        })
        .catch(err => {
          done(err);
        });
    });
  });
});
