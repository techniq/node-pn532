'use strict';
var EventEmitter = require('events').EventEmitter;
var c = require('./constants');
var logger = require('winston').loggers.get('i2c');

function sleep(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

class PN532_I2C_Firmata extends EventEmitter {
    constructor(board) {
        super();
        this.board = board;
    }

    init() {
        logger.debug('Initializing I2C...');
        // TODO: Allow pins to be configurable
        const RESET_PIN = 20;
        const IRQ_PIN = 21;

        return new Promise((resolve, reject) => {
            this.board.pinMode(IRQ_PIN, this.board.MODES.INPUT);
            this.board.digitalRead(IRQ_PIN, value => {
              logger.debug('IRQ', value);

              // Wait for IRQ to drop low.  See 6.3.3.2 of User Guide
              // TODO: Allow using polling instead of IRQ pin (setInterval(..., 500))?
              if (!value) {
                logger.debug('i2cRead')
                this.board.i2cReadOnce(c.I2C_ADDRESS, 26, (data) => {
                  logger.debug('Read', data);
                  
                  if (data[0] & 1) { // RDY
                    // Ready
                    logger.debug('RDY bit found')

                    // Slice off RDY bit and convert byte array to Buffer
                    this.emit('data', new Buffer(data.slice(1)));
                  }
                })
              }
            });

            // Not sure if required.  See https://github.com/adafruit/Adafruit-PN532/blob/master/Adafruit_PN532.cpp#L223
            this.board.pinMode(RESET_PIN, this.board.MODES.OUTPUT);
            this.board.digitalWrite(RESET_PIN, this.board.HIGH);
            this.board.digitalWrite(RESET_PIN, this.board.LOW);

            sleep(400).then(() => {
              this.board.digitalWrite(RESET_PIN, this.board.HIGH);

              sleep(10).then(() => {
                logger.debug('I2C initialized.');
                resolve();
              })
            })
        });
    }

    write(buffer) {
      logger.debug('writing...', 'length', buffer.length, buffer);
      this.board.i2cWrite(c.I2C_ADDRESS, Array.from(buffer));
    }
}

module.exports = PN532_I2C_Firmata;
