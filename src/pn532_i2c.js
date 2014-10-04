var Promise = require('bluebird');
var EventEmitter = require('events').EventEmitter;

var logger = require('winston').loggers.get('i2c');

class PN532_I2C extends EventEmitter {
    constructor(wire) {
        this.wire = wire;
    }

    init() {
        logger.debug('Initing i2c...');
        return new Promise((resolve, reject) => {
            this.wire.on('data', (data) => {
                this.emit('data', data);
            });

            this.wire.on('error', (error) => {
                this.emit('error', error);
            });

            return this.wakeup().then(resolve);
        });
    }

    wakeup() {
        logger.debug('Waking up PN532...');

        return new Promise((resolve, reject) => {
            // TODO: Need to do anything else with I2C.  Send an empty frame?
            resolve();
        });
    }

    write(buffer) {
        this.wire.write(buffer);
    }
}

module.exports = PN532_I2C;
