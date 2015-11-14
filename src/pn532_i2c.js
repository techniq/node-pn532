'use strict';
var EventEmitter = require('events').EventEmitter;
var logger = require('winston').loggers.get('i2c');

class PN532_I2C extends EventEmitter {
    constructor(wire) {
        super();
        this.wire = wire;
    }

    init() {
        logger.debug('Initializing I2C...');
        return new Promise((resolve, reject) => {
            this.wire.on('data', (data) => {
                this.emit('data', data);
            });

            this.wire.on('error', (error) => {
                this.emit('error', error);
            });

            resolve();
        });
    }

    write(buffer) {
        this.wire.write(buffer);
    }
}

module.exports = PN532_I2C;
