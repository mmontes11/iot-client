import winston from 'winston';

winston.remove(winston.transports.Console);
winston.remove(winston.transports.File);

winston.add(winston.transports.Console, {
    timestamp: false,
    json: false,
    colorize: true
});
winston.add(winston.transports.File, {
    timestamp: true,
    json: false,
    colorize: true,
    filename: 'log_iot_client.log'
});

export default winston;