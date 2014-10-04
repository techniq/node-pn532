var $__Object$defineProperty = Object.defineProperty;
var $__Object$create = Object.create;
var Promise = require('bluebird');
var EventEmitter = require('events').EventEmitter;
var logger = require('winston').loggers.get('hsu');

var PN532_HSU = function($__super) {
    "use strict";

    function PN532_HSU(serialPort) {
        this.serial = serialPort;
    }

    PN532_HSU.__proto__ = ($__super !== null ? $__super : Function.prototype);
    PN532_HSU.prototype = $__Object$create(($__super !== null ? $__super.prototype : null));

    $__Object$defineProperty(PN532_HSU.prototype, "constructor", {
        value: PN532_HSU
    });

    $__Object$defineProperty(PN532_HSU.prototype, "init", {
        value: function() {
            logger.debug('Initing HSU...');
            return new Promise(function(resolve, reject) {
                this.serial.on('open', function(error) {
                    if (error) {
                        logger.error('Error on opening HSU', error);
                        reject();
                    }

                    this.serial.on('data', function(data) {
                        this.emit('data', data);
                    }.bind(this));

                    return this.wakeup().then(resolve);
                }.bind(this));
                this.serial.on('error', function(error) {
                    logger.error('An error occurred on HSU', error);
                    reject();
                });
            }.bind(this));
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(PN532_HSU.prototype, "wakeup", {
        value: function() {
            logger.debug('Waking up PN532...');

            return new Promise(function(resolve, reject) {
                this.serial.write(new Buffer([0x55, 0x55, 0x00, 0x00, 0x00]));
                resolve();
            }.bind(this));
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(PN532_HSU.prototype, "write", {
        value: function(buffer) {
            this.serial.write(buffer);
        },

        enumerable: false,
        writable: true
    });

    return PN532_HSU;
}(EventEmitter);

module.exports = PN532_HSU;
