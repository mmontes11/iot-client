# iot-client
[![Build Status](https://travis-ci.org/mmontes11/iot-client.svg?branch=develop)](https://travis-ci.org/mmontes11/iot-client)
[![Coverage Status](https://coveralls.io/repos/github/mmontes11/iot-client/badge.svg?branch=develop)](https://coveralls.io/github/mmontes11/iot-client?branch=develop)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

ES6 client library for consuming [IoT backend](https://github.com/mmontes11/iot-backend) REST API

### Installing

```bash
$ npm install @mmontes11/iot-client --save
```

### Usage example

``` javascript
import IoTClient from "@mmontes11/iot-client";

const iotClient = new IoTClient({
  host: 'http://localhost:800',
  username: 'foo',
  password: 'bar',
  basicAuthUsername: 'foo',
  basicAuthPassword: 'bar'
});

try {
  const response = await iotClient.observationsService.create({
      observations: observations,
      thing: thing
  });
  console.log(response.createdObservations);
} catch (err) {
  console.log(err);
}
```
