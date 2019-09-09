const winston = require('winston');
require('winston-mail');

let logger = winston.createLogger({
    transports: [
        new (winston.transports.Console)({
            json: true,
            colorize: true
        }),
        new (winston.transports.File)({
            name: 'vehicle-log',
            filename: './errors.log',
            level: 'info',
            timestamp: true,
            colorize: true,
            handleExceptions: true,
            humanReadableUnhandledException: true,
            prettyPrint: true,
            json: true,
            maxsize: 5242880
        }),
        new winston.transports.Mail({
            to: process.env.GMAIL,
            from: process.env.GMAIL,
            subject: 'uncaught Exception Report',
            host: 'smtp.gmail.com',
            username: process.env.GMAIL,
            password: process.env.GMAIL_PW,
            ssl: true
        })
    ],
    exceptionHandlers: [
        new winston.transports.Mail({
            to: process.env.GMAIL,
            from: process.env.GMAIL,
            subject: 'uncaught Exception Report',
            host: 'smtp.gmail.com',
            username: process.env.GMAIL,
            password: process.env.GMAIL_PW,
            ssl: true
        })
    ]
});

module.exports = logger;
module.exports.stream = {
    write: function (message, encoding) {
        logger.info(message);
    }
};
