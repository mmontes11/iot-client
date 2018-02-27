# iot-client

[![Build Status](https://travis-ci.org/mmontes11/iot-client.svg?branch=develop)](https://travis-ci.org/mmontes11/iot-client)
[![Coverage Status](https://coveralls.io/repos/github/mmontes11/iot-client/badge.svg?branch=develop)](https://coveralls.io/github/mmontes11/iot-client?branch=develop)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![StackShare](https://img.shields.io/badge/tech-stack-0690fa.svg?style=flat)](https://stackshare.io/mmontes11/iot)

[![NPM](https://nodei.co/npm/@mmontes11/iot-client.png)](https://nodei.co/npm/@mmontes11/iot-client)

ES6 client library for consuming [IoT backend](https://github.com/mmontes11/iot-backend) REST API

### Installing

```bash
$ npm i @mmontes11/iot-client --save
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
  const res = await iotClient.observationsService.create({
      observations: observations,
      thing: thing
  });
  console.log(res);
} catch (err) {
  console.log(err);
}
```
