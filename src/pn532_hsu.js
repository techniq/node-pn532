var util = require('util');
var SerialPort = require('serialport').SerialPort
var Promise = require('bluebird');
var EventEmitter = require('events').EventEmitter;

var setupLogging = require('./logs');
setupLogging(process.env.NODE_ENV === 'debug' ? 'debug' : 'info');
var logger = require('winston').loggers.get('hsu');

var FrameEmitter = require('./frame_emitter').FrameEmitter;
var DataFrame = require('./frame').DataFrame;
var c = require('./constants');

// var i2c = require('i2c');
// var Gpio = require('onoff').Gpio;


class PN532_HSU extends EventEmitter {
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
        logger.info('Configuring secure access module (SAM)...');

        // TODO: Test IRQ triggered reads
        var commandBuffer = [
            c.COMMAND_SAMCONFIGURATION,
            c.SAMCONFIGURATION_MODE_NORMAL,
            0x00,                   // Timeout
            c.SAMCONFIGURATION_IRQ_ON // Use IRQ pin
        ];
        return this.writeCommand(commandBuffer);
    }

    getFirmwareVersion() {
        logger.info('Getting firmware version...');

        return this.writeCommand([c.COMMAND_GET_FIRMWARE_VERSION])
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
        logger.info('Getting general status...');

        return this.writeCommand([c.COMMAND_GET_GENERAL_STATUS])
            .then((frame) => {
                var body = frame.getDataBody();
                return body;
            });
    }

    readPassiveTargetId() {
        logger.info('Reading passive target id...');

        var commandBuffer = [
            c.COMMAND_INLISTPASSIVETARGET,
            0x01,
            c.CARD_ISO14443A
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

module.exports = PN532_HSU;
