"use strict";

var _inherits = function (child, parent) {
  child.prototype = Object.create(parent && parent.prototype, {
    constructor: {
      value: child,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (parent) child.__proto__ = parent;
};

var Promise = require("bluebird");
var EventEmitter = require("events").EventEmitter;
var logger = require("winston").loggers.get("uart");

var PN532_UART = (function () {
  var _EventEmitter = EventEmitter;
  var PN532_UART = function PN532_UART(serialPort) {
    this.serial = serialPort;
    this.isAwake = false;
  };

  _inherits(PN532_UART, _EventEmitter);

  PN532_UART.prototype.init = function () {
    var _this = this;
    logger.debug("Initializing serial port...");
    return new Promise(function (resolve, reject) {
      _this.serial.on("open", function (error) {
        if (error) {
          logger.error("Error opening serial port", error);
          reject();
        }

        _this.serial.on("data", function (data) {
          _this.emit("data", data);
        });

        logger.debug("Serial port initialized.");
        resolve();
      });
      _this.serial.on("error", function (error) {
        logger.error("An error occurred on serial port", error);
        reject();
      });
    });
  };

  PN532_UART.prototype.write = function (buffer) {
    if (!this.isAwake) {
      logger.debug("Waking up PN532...");
      var wakeup = new Buffer([85, 85, 0, 0, 0, 0, 0, 0, 0, 0]);
      buffer = Buffer.concat([wakeup, buffer]);
      this.isAwake = true;
    }

    this.serial.write(buffer);
  };

  return PN532_UART;
})();

module.exports = PN532_UART;