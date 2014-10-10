var $__Object$defineProperty = Object.defineProperty;
var $__Object$create = Object.create;
var Promise = require('bluebird');
var EventEmitter = require('events').EventEmitter;
var logger = require('winston').loggers.get('uart');

var PN532_UART = function($__super) {
    "use strict";

    function PN532_UART(serialPort) {
        this.serial = serialPort;
        this.isAwake = false;
    }

    PN532_UART.__proto__ = ($__super !== null ? $__super : Function.prototype);
    PN532_UART.prototype = $__Object$create(($__super !== null ? $__super.prototype : null));

    $__Object$defineProperty(PN532_UART.prototype, "constructor", {
        value: PN532_UART
    });

    $__Object$defineProperty(PN532_UART.prototype, "init", {
        value: function() {
            logger.debug('Initializing serial port...');
            return new Promise(function(resolve, reject) {
                this.serial.on('open', function(error) {
                    if (error) {
                        logger.error('Error opening serial port', error);
                        reject();
                    }

                    this.serial.on('data', function(data) {
                        this.emit('data', data);
                    }.bind(this));

                    logger.debug('Serial port initialized.');
                    resolve();
                }.bind(this));
                this.serial.on('error', function(error) {
                    logger.error('An error occurred on serial port', error);
                    reject();
                });
            }.bind(this));
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(PN532_UART.prototype, "write", {
        value: function(buffer) {
            if (!this.isAwake) {
                logger.debug('Waking up PN532...');
                this.serial.write(new Buffer([0x55, 0x55, 0x00, 0x00, 0x00]));
                this.isAwake = true;
            }

            this.serial.write(buffer);
        },

        enumerable: false,
        writable: true
    });

    return PN532_UART;
}(EventEmitter);

module.exports = PN532_UART;
