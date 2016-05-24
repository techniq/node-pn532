'use strict';
var EventEmitter = require('events').EventEmitter;
var c = require('./constants');
var logger = require('winston').loggers.get('i2c');

class PN532_I2C extends EventEmitter {
    constructor(bus) {
        super();
        this.bus = bus;
    }

    init() {
        logger.debug('Initializing I2C...');
        return new Promise((resolve, reject) => {
            setInterval(() => {
              var readBuffer = new Buffer(26);
              this.bus.i2cRead(c.I2C_ADDRESS, 26, readBuffer, (err, bytesRead, buffer) => {
                logger.debug('Read', err, bytesRead, buffer);
                
                if (err) {
                  this.emit('error', err);
                } else if (buffer[0] & 1) { // RDY
                  // Ready
                  this.emit('data', buffer.slice(1)); // Slice off 
                }
              })
            }, 500);
            // this.wire.on('data', (data) => {
            //     this.emit('data', data);
            // });

            // this.wire.on('error', (error) => {
            //     this.emit('error', error);
            // });

            logger.debug('I2C bus initialized.');
            resolve();
        });
    }

    write(buffer) {
      logger.debug('writing...', 'length', buffer.length, buffer);
        this.bus.i2cWrite(c.I2C_ADDRESS, buffer.length, buffer, (err, bytesWritten, buffer) => {
          logger.debug('Wrote', err, bytesWritten, buffer);
          
          // 7 = size of ACK frame + 7 (ready bit)
          // addr, length, buffer, cb
          // var readBuffer = new Buffer(16);
          // this.bus.i2cRead(c.I2C_ADDRESS, 16, readBuffer, (err, bytesRead, buffer) => {
          //   logger.debug('Read', err, bytesRead, buffer);
          // })
        });
    }
}

module.exports = PN532_I2C;
