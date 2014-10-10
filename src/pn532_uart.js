var Promise = require('bluebird');
var EventEmitter = require('events').EventEmitter;
var logger = require('winston').loggers.get('uart');

class PN532_UART extends EventEmitter {
    constructor(serialPort) {
        this.serial = serialPort;
        this.isAwake = false;
    }

    init() {
        logger.debug('Initializing serial port...');
        return new Promise((resolve, reject) => {
            this.serial.on('open', (error) => {
                if (error) {
                    logger.error('Error opening serial port', error);
                    reject();
                }

                this.serial.on('data', (data) => {
                    this.emit('data', data);
                });

                logger.debug('Serial port initialized.');
                resolve();
            });
            this.serial.on('error', (error) => {
                logger.error('An error occurred on serial port', error);
                reject();
            });
        });
    }

    write(buffer) {
        if (!this.isAwake) {
            logger.debug('Waking up PN532...');
            this.serial.write(new Buffer([0x55, 0x55, 0x00, 0x00, 0x00]));
            this.isAwake = true;
        }

        this.serial.write(buffer);
    }
}

module.exports = PN532_UART;
