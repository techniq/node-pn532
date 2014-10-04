var Promise = require('bluebird');
var EventEmitter = require('events').EventEmitter;

var logger = require('winston').loggers.get('hsu');

class PN532_HSU extends EventEmitter {
    constructor(serialPort) {
        this.serial = serialPort;
    }

    init() {
        logger.debug('Initing HSU...');
        return new Promise((resolve, reject) => {
            this.serial.on('open', (error) => {
                if (error) {
                    logger.error('Error on opening HSU', error);
                    reject();
                }

                this.serial.on('data', (data) => {
                    this.emit('data', data);
                });

                return this.wakeup().then(resolve);
            });
            this.serial.on('error', (error) => {
                logger.error('An error occurred on HSU', error);
                reject();
            });
        });
    }

    wakeup() {
        logger.debug('Waking up PN532...');

        return new Promise((resolve, reject) => {
            this.serial.write(new Buffer([0x55, 0x55, 0x00, 0x00, 0x00]));
            resolve();
        });
    }

    write(buffer) {
        this.serial.write(buffer);
    }
}

module.exports = PN532_HSU;
