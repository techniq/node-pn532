var util = require('util');
var SerialPort = require('serialport').SerialPort
var Promise = require('bluebird');
var EventEmitter = require('events').EventEmitter;

import { setupLogging } from './logs';
setupLogging(process.env.NODE_ENV === 'debug' ? 'debug' : 'warn');

var winston = require('winston');
var logger = winston.loggers.get('hsu');

// var i2c = require('i2c');
// var Gpio = require('onoff').Gpio;

import { DataFrame } from './frame';
import { FrameEmitter } from './frame_emitter';
import {
    COMMAND_GET_FIRMWARE_VERSION,
    COMMAND_GET_GENERAL_STATUS,
    COMMAND_INLISTPASSIVETARGET,
    COMMAND_SAMCONFIGURATION,
    SAMCONFIGURATION_MODE_NORMAL,
    SAMCONFIGURATION_IRQ_ON,
    DIRECTION_HOST_TO_PN532,
    CARD_ISO14443A
} from './constants';


export class PN532_HSU extends EventEmitter {
    constructor(port, options) {
        options = options || {};
        this.port = port || '/dev/ttyO1';
        this.options = options || { baudrate: 115200 };
        // this.irq_gpio = options.irq_gpio || null;

        logger.info('port: ', this.port, ', options: ', this.options);

        this.serial = new SerialPort(this.port, this.options);
        this.serial.on('open', (error) => {
            if (error) {
                logger.error('Error on opening serial', error);
            }

            this.frameEmitter = new FrameEmitter(this.serial);
            this.wakeup().then(() => this.emit('ready'));
        });
        this.serial.on('error', (error) => {
            logger.error('An error occurred on serial port');
        });

        // var self = this;
        //
        // if (this.irq_gpio) {
        //     var irq = new Gpio(this.irq_gpio, 'in', 'falling'); // P8_18
        //     irq.watch(function(err, value) {
        //         console.log('irq triggered');
        //
        //         // self.wire.readBytes(self.address, 12, function(err, res) {
        //         //     // result contains a buffer of bytes
        //         //     console.log(err);
        //         //     console.log(res);
        //         // });
        //     });
        // }
    }

    wakeup() {
        logger.debug('Waking up PN532...');

        return new Promise((resolve, reject) => {
            this.serial.write(new Buffer([0x55, 0x55, 0x00, 0x00, 0x00]));
            return this.samConfig().then(resolve);
        });
    }

    writeCommand(commandBuffer) {
        return new Promise((resolve, reject) => {

            var removeListeners = () => {
                logger.debug('removing listeners');
                this.frameEmitter.removeListener('frame', onFrame);
                this.frameEmitter.removeListener('error', onError);
            };

            // Wire up listening to wait for response (or error) from PN532
            var onFrame = (frame) => {
                logger.debug('response received for writeCommand', util.inspect(frame));
                // TODO: If no ACK after 15ms, resend? (page 40 of user guide, HSU only)?

                // TODO: Is ACK'ing required?
                // TODO: Create/send ACK frame better
                // var ackFrame = new AckFrame(DIRECTION_HOST_TO_PN532).toBuffer();
                // console.log('sending ACK', ackFrame);
                // this.serial.write(ackFrame);

                if (frame instanceof DataFrame) {
                    logger.debug('isResponse', util.inspect(frame));
                    removeListeners();
                    resolve(frame);
                }
            };
            this.frameEmitter.on('frame', onFrame);

            var onError = (error) => {
                logger.error('error received for writeCommand', error);
                removeListeners();
                reject(error);
            };
            this.frameEmitter.on('error', onError);

            // Send command to PN532
            var dataFrame = new DataFrame(commandBuffer);
            var buffer = dataFrame.toBuffer();

            logger.debug('Sending buffer: ', util.inspect(buffer));
            this.serial.write(buffer);
        });
    }

    samConfig() {
        logger.debug(new Array(80).join('-'));
        logger.debug('Configuring secure access module (SAM)...');

        // TODO: Test IRQ triggered reads
        var commandBuffer = [
            COMMAND_SAMCONFIGURATION,
            SAMCONFIGURATION_MODE_NORMAL,
            0x00,                   // Timeout
            SAMCONFIGURATION_IRQ_ON // Use IRQ pin
        ];
        return this.writeCommand(commandBuffer);
    }

    getFirmwareVersion() {
        logger.debug(new Array(80).join('-'));
        logger.debug('Getting firmware version...');

        return this.writeCommand([COMMAND_GET_FIRMWARE_VERSION])
            .then((frame) => {
                var body = frame.getDataBody();
                return {
                    IC: body[0],
                    Ver: body[1],
                    Rev: body[2],
                    Support: body[3]
                };
            });
    }

    getGeneralStatus() {
        logger.debug(new Array(80).join('-'));
        logger.debug('Getting general status...');

        return this.writeCommand([COMMAND_GET_GENERAL_STATUS])
            .then((frame) => {
                var body = frame.getDataBody();
                return body;
            });
    }

    readPassiveTargetId() {
        logger.debug(new Array(80).join('-'));
        logger.debug('Reading passive target id...');

        var commandBuffer = [
            COMMAND_INLISTPASSIVETARGET,
            0x01,
            CARD_ISO14443A
        ];

        return this.writeCommand(commandBuffer)
            .then((frame) => {
                var body = frame.getDataBody();

                var numberOfTags = body[0];
                if (numberOfTags === 1) {
                    var tagNumber = body[1];
                    var uidLength = body[5];

                    return {
                        SENS_RES: body.slice(2, 4),
                        SEL_RES: body[4],
                        uid: body.slice(6, 6 + uidLength)
                    };
                }
            });
    }
}
