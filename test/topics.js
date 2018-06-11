import _ from "underscore";
import httpStatus from "http-status";
import chai from "./lib/chai";
import serverConfig from "./lib/iot-server/src/config/index";
import { TopicModel } from "./lib/iot-server/src/models/topic";
import { UserModel } from "./lib/iot-server/src/models/user";
import { TokenHandler } from "../src/helpers/tokenHandler";
import IoTClient from "../src/index";
import authConstants from "./lib/iot-server/test/constants/auth";
import topicsConstants from "./lib/iot-server/test/constants/topics";
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

describe("Topics", () => {
  before(async () => {
    await TokenHandler.invalidateToken();
    assert((await TokenHandler.getToken()) === undefined, "Token should be undefined");
    await UserModel.remove({});
    await client.authService.createUser(authConstants.validUser);
  });

  before(done => {
    TopicModel.remove({})
      .then(() => done())
      .catch(err => done(err));
  });

  describe("GET /topics 404", () => {
    it("tries to get topics but no one has been created yet", done => {
      const promise = client.topicsService.getTopics();
      promise.should.eventually.be.rejected.and.have.property("statusCode", httpStatus.NOT_FOUND).and.notify(done);
    });
  });

  describe("GET /topics 200", () => {
    before(done => {
      const topics = [topicsConstants.validTopic, topicsConstants.validTopic2, topicsConstants.validTopic3];
      const promises = _.map(topics, topic => {
        const newTopic = new TopicModel(topic);
        return newTopic.save();
      });
      Promise.all(promises)
        .then(() => done())
        .catch(err => done(err));
    });
    it("gets topics", done => {
      const promise = client.topicsService.getTopics();
      promise.should.eventually.be.fulfilled.and.have.property("statusCode", httpStatus.OK).and.notify(done);
    });
  });
});
