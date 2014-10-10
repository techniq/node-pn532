var $__Object$defineProperty = Object.defineProperty;
var $__Object$create = Object.create;
var util = require('util');
var Promise = require('bluebird');
var EventEmitter = require('events').EventEmitter;
var setupLogging = require('./logs');
setupLogging(process.env.PN532_LOGGING);
var logger = require('winston').loggers.get('pn532');
var FrameEmitter = require('./frame_emitter').FrameEmitter;
var DataFrame = require('./frame').DataFrame;
var c = require('./constants');

var PN532 = function($__super) {
    "use strict";

    function PN532(hal, options) {
        options = options || {};
        this.pollInterval = options.pollInternal || 1000;

        if (hal.constructor.name === 'SerialPort') {
            var PN532_UART = require('./pn532_uart');
            this.hal = new PN532_UART(hal);
        } else if (hal.constructor.name === 'i2c') {
            var PN532_I2C = require('./pn532_i2c');
            this.hal = new PN532_I2C(hal);
        } else {
            throw new Error('Unknown hardware type: ', hal.constructor.name);
        }

        this.frameEmitter = new FrameEmitter(this.hal);
        this.hal.init().then(function() {
            this.samConfig().then(function() {
                return this.emit('ready');
            }.bind(this));
        }.bind(this));

        this.on('newListener', function(event) {
            // TODO: Only poll once (for each event type)
            if (event === 'card') {
                logger.debug('Polling for card scans...');
                var pollCard = function() {
                    this.readPassiveTargetId().then(function(card) {
                        this.emit('card', card);
                        setTimeout(function() {
                            return pollCard();
                        }, this.pollInterval);
                    }.bind(this));
                }.bind(this);
                pollCard();
            }
        }.bind(this));
    }

    PN532.__proto__ = ($__super !== null ? $__super : Function.prototype);
    PN532.prototype = $__Object$create(($__super !== null ? $__super.prototype : null));

    $__Object$defineProperty(PN532.prototype, "constructor", {
        value: PN532
    });

    $__Object$defineProperty(PN532.prototype, "writeCommand", {
        value: function(commandBuffer) {
            return new Promise(function(resolve, reject) {

                var removeListeners = function() {
                    logger.debug('removing listeners');
                    this.frameEmitter.removeListener('frame', onFrame);
                    this.frameEmitter.removeListener('error', onError);
                }.bind(this);

                // Wire up listening to wait for response (or error) from PN532
                var onFrame = function(frame) {
                    logger.debug('response received for writeCommand', util.inspect(frame));
                    // TODO: If no ACK after 15ms, resend? (page 40 of user guide, UART only)?

                    if (frame instanceof DataFrame) {
                        logger.debug('isResponse', util.inspect(frame));
                        removeListeners();
                        resolve(frame);
                    }
                };
                this.frameEmitter.on('frame', onFrame);

                var onError = function(error) {
                    logger.error('error received for writeCommand', error);
                    removeListeners();
                    reject(error);
                };
                this.frameEmitter.on('error', onError);

                // Send command to PN532
                var dataFrame = new DataFrame(commandBuffer);
                var buffer = dataFrame.toBuffer();
                logger.debug('Sending buffer: ', util.inspect(buffer));
                this.hal.write(buffer);
            }.bind(this));
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(PN532.prototype, "samConfig", {
        value: function() {
            logger.info('Configuring secure access module (SAM)...');

            // TODO: Test IRQ triggered reads

            var timeout = 0x00;  // 0x00-0xFF (12.75 seconds).  Only valid for Virtual card mode (SAMCONFIGURATION_MODE_VIRTUAL_CARD)

            var commandBuffer = [
                c.COMMAND_SAMCONFIGURATION,
                c.SAMCONFIGURATION_MODE_NORMAL,
                timeout,
                c.SAMCONFIGURATION_IRQ_ON // Use IRQ pin
            ];
            return this.writeCommand(commandBuffer);
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(PN532.prototype, "getFirmwareVersion", {
        value: function() {
            logger.info('Getting firmware version...');

            return this.writeCommand([c.COMMAND_GET_FIRMWARE_VERSION])
                .then(function(frame) {
                    var body = frame.getDataBody();
                    return {
                        IC: body[0],
                        Ver: body[1],
                        Rev: body[2],
                        Support: body[3]
                    };
                });
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(PN532.prototype, "getGeneralStatus", {
        value: function() {
            logger.info('Getting general status...');

            return this.writeCommand([c.COMMAND_GET_GENERAL_STATUS])
                .then(function(frame) {
                    var body = frame.getDataBody();
                    return body;
                });
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(PN532.prototype, "readPassiveTargetId", {
        value: function() {
            logger.info('Reading passive target id...');

            var commandBuffer = [
                c.COMMAND_INLISTPASSIVETARGET,
                0x01,
                c.CARD_ISO14443A
            ];

            return this.writeCommand(commandBuffer)
                .then(function(frame) {
                    var body = frame.getDataBody();

                    var numberOfTags = body[0];
                    if (numberOfTags === 1) {
                        var tagNumber = body[1];
                        var uidLength = body[5];

                        var uid = body.slice(6, 6 + uidLength)
                                      .toString('hex')
                                      .match(/.{1,2}/g)
                                      .join(':');

                        return {
                            SENS_RES: body.slice(2, 4),
                            SEL_RES: body[4],
                            uid: uid
                        };
                    }
                });
        },

        enumerable: false,
        writable: true
    });

    return PN532;
}(EventEmitter);

exports.PN532 = PN532;
exports.I2C_ADDRESS = c.I2C_ADDRESS;
