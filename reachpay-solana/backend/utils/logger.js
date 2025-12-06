const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define log colors
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};

winston.addColors(colors);

// Determine log level based on environment
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    return env === 'development' ? 'debug' : 'info';
};

// Define log format
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} [${info.level}]: ${info.message}`
    )
);

// Define transports
const transports = [
    new winston.transports.Console(),
    new winston.transports.File({
        filename: path.join(__dirname, '../logs/error.log'),
        level: 'error',
    }),
    new winston.transports.File({
        filename: path.join(__dirname, '../logs/combined.log'),
    }),
];

// Create logger instance
const logger = winston.createLogger({
    level: level(),
    levels,
    format,
    transports,
    exitOnError: false,
});

module.exports = logger;
