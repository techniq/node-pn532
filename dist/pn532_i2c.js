var $__Object$defineProperty = Object.defineProperty;
var $__Object$create = Object.create;
var Promise = require('bluebird');
var EventEmitter = require('events').EventEmitter;
var logger = require('winston').loggers.get('i2c');

var PN532_I2C = function($__super) {
    "use strict";

    function PN532_I2C(wire) {
        this.wire = wire;
    }

    PN532_I2C.__proto__ = ($__super !== null ? $__super : Function.prototype);
    PN532_I2C.prototype = $__Object$create(($__super !== null ? $__super.prototype : null));

    $__Object$defineProperty(PN532_I2C.prototype, "constructor", {
        value: PN532_I2C
    });

    $__Object$defineProperty(PN532_I2C.prototype, "init", {
        value: function() {
            logger.debug('Initing i2c...');
            return new Promise(function(resolve, reject) {
                this.wire.on('data', function(data) {
                    this.emit('data', data);
                }.bind(this));

                this.wire.on('error', function(error) {
                    this.emit('error', error);
                }.bind(this));

                return this.wakeup().then(resolve);
            }.bind(this));
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(PN532_I2C.prototype, "wakeup", {
        value: function() {
            logger.debug('Waking up PN532...');

            return new Promise(function(resolve, reject) {
                // TODO: Need to do anything else with I2C.  Send an empty frame?
                resolve();
            });
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(PN532_I2C.prototype, "write", {
        value: function(buffer) {
            this.wire.write(buffer);
        },

        enumerable: false,
        writable: true
    });

    return PN532_I2C;
}(EventEmitter);

module.exports = PN532_I2C;
