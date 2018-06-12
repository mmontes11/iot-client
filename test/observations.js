import httpStatus from "http-status";
import chai from "./lib/chai";
import serverConfig from "./lib/iot-server/src/config/index";
import { UserModel } from "./lib/iot-server/src/models/user";
import { TokenHandler } from "../src/helpers/tokenHandler";
import IoTClient from "../src/index";
import observationConstants from "./lib/iot-server/test/constants/observations";
import authConstants from "./lib/iot-server/test/constants/auth";
import thingConstants from "./lib/iot-server/test/constants/thing";
import "./lib/iot-server/src/index";

const { assert } = chai;
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

describe("Observations", () => {
  before(async () => {
    await TokenHandler.invalidateToken();
    assert((await TokenHandler.getToken()) === undefined, "Token should be undefined");
    await UserModel.remove({});
    await client.authService.createUser(authConstants.validUser);
  });

  describe("POST /observations 401", () => {
    it("tries to createUser observations with invalid credentials", done => {
      const promise = clientWithInvalidCredentials.observationsService.create(
        observationConstants.temperatureMeasurement,
      );
      promise.should.eventually.be.rejected.and.have.property("statusCode", httpStatus.UNAUTHORIZED).and.notify(done);
    });
  });

  describe("POST /observations 304", () => {
    it("tries to createUser observations using an empty array", done => {
      const emptyObservations = {
        observations: [],
      };
      const promise = client.observationsService.create(emptyObservations);
      promise.should.eventually.be.fulfilled.and.have.property("statusCode", httpStatus.NOT_MODIFIED).and.notify(done);
    });
  });

  describe("POST /observations 400", () => {
    it("tries to createUser observations using an invalid payload", done => {
      const invalidPayload = {
        foo: [],
      };
      const promise = client.observationsService.create(invalidPayload);
      promise.should.eventually.be.rejected.and.have.property("statusCode", httpStatus.BAD_REQUEST).and.notify(done);
    });
    it("tries to createUser invalid observations", done => {
      const invalidObservations = {
        observations: [
          observationConstants.invalidMeasurementWithKind,
          observationConstants.validMeasurementWithInvalidKind,
          observationConstants.invalidEventWithKind,
          observationConstants.validEventWithInvalidKind,
        ],
      };
      const promise = client.observationsService.create(invalidObservations);
      promise.should.eventually.be.rejected.and.have.property("statusCode", httpStatus.BAD_REQUEST).and.notify(done);
    });
  });

  describe("POST /observations 201", () => {
    it("creates observations", done => {
      const validObservations = {
        observations: [observationConstants.validMeasurementWithKind, observationConstants.validEventWithKind],
        thing: thingConstants.thingAtNYC,
      };
      const promise = client.observationsService.create(validObservations);
      promise.should.eventually.be.fulfilled.and.have.property("statusCode", httpStatus.CREATED).and.notify(done);
    });
  });

  describe("POST /observations 207", () => {
    it("creates observations and also tries to createUser invalid ones", done => {
      const measurements = [
        observationConstants.validMeasurementWithKind,
        observationConstants.validMeasurementWithInvalidKind,
        observationConstants.invalidMeasurementWithKind,
      ];
      const events = [
        observationConstants.validEventWithKind,
        observationConstants.validEventWithInvalidKind,
        observationConstants.invalidEventWithKind,
      ];
      const validAndInvalidObservations = {
        observations: [...measurements, ...events],
        thing: thingConstants.thingAtNYC,
      };
      const promise = client.observationsService.create(validAndInvalidObservations);
      promise.should.eventually.be.fulfilled.and.have.property("statusCode", httpStatus.MULTI_STATUS).and.notify(done);
    });
  });
});
