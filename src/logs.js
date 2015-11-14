'use strict';
var winston = require('winston');

module.exports = function setupLogging(level) {
    level = level || 'warn';

    // winston.loggers.options.transports = [
    //     new winston.transports.Console({
    //         level: 'debug',
    //         colorize: 'true',
    //         label: 'pn532'
    //     })
    // ];

    winston.loggers.add('pn532', {
        console: {
          level: level,
          colorize: 'true',
          label: 'pn532'
        }
    });

    winston.loggers.add('frame', {
        console: {
          level: level,
          colorize: 'true',
          label: 'frame'
        }
    });

    winston.loggers.add('frame-emitter', {
        console: {
          level: level,
          colorize: 'true',
          label: 'frame-emitter'
        }
    });

    winston.loggers.add('uart', {
        console: {
          level: level,
          colorize: 'true',
          label: 'hsu'
        }
    });

    winston.loggers.add('i2c', {
        console: {
          level: level,
          colorize: 'true',
          label: 'hsu'
        }
    });
}
