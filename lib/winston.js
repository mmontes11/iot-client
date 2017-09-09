import winston from 'winston';

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
    timestamp: false,
    json: false,
    colorize: true
});

export default winston;