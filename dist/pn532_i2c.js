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
var logger = require("winston").loggers.get("i2c");

var PN532_I2C = (function () {
  var _EventEmitter = EventEmitter;
  var PN532_I2C = function PN532_I2C(wire) {
    this.wire = wire;
  };

  _inherits(PN532_I2C, _EventEmitter);

  PN532_I2C.prototype.init = function () {
    var _this = this;
    logger.debug("Initializing I2C...");
    return new Promise(function (resolve, reject) {
      _this.wire.on("data", function (data) {
        _this.emit("data", data);
      });

      _this.wire.on("error", function (error) {
        _this.emit("error", error);
      });

      resolve();
    });
  };

  PN532_I2C.prototype.write = function (buffer) {
    this.wire.write(buffer);
  };

  return PN532_I2C;
})();

module.exports = PN532_I2C;