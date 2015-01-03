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

var util = require("util");
var Promise = require("bluebird");
var EventEmitter = require("events").EventEmitter;

var setupLogging = require("./logs");
setupLogging(process.env.PN532_LOGGING);
var logger = require("winston").loggers.get("pn532");

var FrameEmitter = require("./frame_emitter").FrameEmitter;
var DataFrame = require("./frame").DataFrame;
var c = require("./constants");

var PN532 = (function () {
  var _EventEmitter = EventEmitter;
  var PN532 = (
    /*
        @constructor
        @param {object} hal - An instance of node-serialport's SerialPort or node-i2c's i2c
    */
    function PN532(hal, options) {
      var _this = this;
      options = options || {};
      this.pollInterval = options.pollInternal || 1000;

      if (hal.constructor.name === "SerialPort") {
        var PN532_UART = require("./pn532_uart");
        this.hal = new PN532_UART(hal);
      } else if (hal.constructor.name === "i2c") {
        var PN532_I2C = require("./pn532_i2c");
        this.hal = new PN532_I2C(hal);
      } else {
        throw new Error("Unknown hardware type: ", hal.constructor.name);
      }

      this.frameEmitter = new FrameEmitter(this.hal);
      this.hal.init().then(function () {
        _this.samConfig().then(function () {
          return _this.emit("ready");
        });
      });

      this.on("newListener", function (event) {
        // TODO: Only poll once (for each event type)
        if (event === "card") {
          logger.debug("Polling for card scans...");
          var pollCard = function () {
            _this.readPassiveTargetId().then(function (card) {
              _this.emit("card", card);
              setTimeout(function () {
                return pollCard();
              }, _this.pollInterval);
            });
          };
          pollCard();
        }
      });
    }
  );

  _inherits(PN532, _EventEmitter);

  PN532.prototype.writeCommand = function (commandBuffer) {
    var _this2 = this;
    return new Promise(function (resolve, reject) {
      var removeListeners = function () {
        logger.debug("removing listeners");
        _this2.frameEmitter.removeListener("frame", onFrame);
        _this2.frameEmitter.removeListener("error", onError);
      };

      // Wire up listening to wait for response (or error) from PN532
      var onFrame = function (frame) {
        logger.debug("response received for writeCommand", util.inspect(frame));
        // TODO: If no ACK after 15ms, resend? (page 40 of user guide, UART only)?

        if (frame instanceof DataFrame) {
          logger.debug("isResponse", util.inspect(frame));
          removeListeners();
          resolve(frame);
        }
      };
      _this2.frameEmitter.on("frame", onFrame);

      var onError = function (error) {
        logger.error("error received for writeCommand", error);
        removeListeners();
        reject(error);
      };
      _this2.frameEmitter.on("error", onError);

      // Send command to PN532
      var dataFrame = new DataFrame(commandBuffer);
      var buffer = dataFrame.toBuffer();
      logger.debug("Sending buffer: ", util.inspect(buffer));
      _this2.hal.write(buffer);
    });
  };

  PN532.prototype.samConfig = function () {
    logger.info("Configuring secure access module (SAM)...");

    // TODO: Test IRQ triggered reads

    var timeout = 0; // 0x00-0xFF (12.75 seconds).  Only valid for Virtual card mode (SAMCONFIGURATION_MODE_VIRTUAL_CARD)

    var commandBuffer = [c.COMMAND_SAMCONFIGURATION, c.SAMCONFIGURATION_MODE_NORMAL, timeout, c.SAMCONFIGURATION_IRQ_ON // Use IRQ pin
    ];
    return this.writeCommand(commandBuffer);
  };

  PN532.prototype.getFirmwareVersion = function () {
    logger.info("Getting firmware version...");

    return this.writeCommand([c.COMMAND_GET_FIRMWARE_VERSION]).then(function (frame) {
      var body = frame.getDataBody();
      return {
        IC: body[0],
        Ver: body[1],
        Rev: body[2],
        Support: body[3]
      };
    });
  };

  PN532.prototype.getGeneralStatus = function () {
    logger.info("Getting general status...");

    return this.writeCommand([c.COMMAND_GET_GENERAL_STATUS]).then(function (frame) {
      var body = frame.getDataBody();
      return body;
    });
  };

  PN532.prototype.readPassiveTargetId = function () {
    logger.info("Reading passive target id...");

    var commandBuffer = [c.COMMAND_IN_LIST_PASSIVE_TARGET, 1, c.CARD_ISO14443A];

    return this.writeCommand(commandBuffer).then(function (frame) {
      var body = frame.getDataBody();

      var numberOfTags = body[0];
      if (numberOfTags === 1) {
        var tagNumber = body[1];
        var uidLength = body[5];

        var uid = body.slice(6, 6 + uidLength).toString("hex").match(/.{1,2}/g).join(":");

        return {
          SENS_RES: body.slice(2, 4),
          SEL_RES: body[4],
          uid: uid
        };
      }
    });
  };

  return PN532;
})();

exports.PN532 = PN532;
exports.I2C_ADDRESS = c.I2C_ADDRESS;