import winston from "winston";
import { MultiPlatformHelper } from "../helpers/multiPlatformHelper";
import { BrowserConsole } from "../util/browserConsole";

let transports = [];

if (MultiPlatformHelper.isBrowser()) {
  transports = [new BrowserConsole()];
} else {
  transports = [
    new winston.transports.Console({
      timestamp: false,
      json: false,
      colorize: true,
    }),
    new winston.transports.File({
      timestamp: true,
      json: false,
      colorize: true,
      filename: "log-iot-client.log",
    }),
  ];
}

const logger = new winston.Logger({
  level: "info",
  transports,
});

export default logger;
