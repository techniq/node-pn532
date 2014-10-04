var $__Object$defineProperty = Object.defineProperty;
var $__Object$create = Object.create;
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var logger = require('winston').loggers.get('frame-emitter');
var frame = require('./frame');
var Frame = frame.Frame;
var DataFrame = frame.DataFrame;
var ErrorFrame = frame.ErrorFrame;

var FrameEmitter = function($__super) {
    "use strict";

    function FrameEmitter(hal) {
        this.hal = hal;
        this.buffer = new Buffer(0);

        logger.debug('listening to data');

        // console.dir(hal);
        this.hal.on('data', function(data) {
            logger.debug('Data received', util.inspect(data));
            this.buffer = Buffer.concat([this.buffer, data]);
            this._processBuffer();
        }.bind(this));

        this.hal.on('error', function(error) {
            this.emit('error', error);
        }.bind(this));
    }

    FrameEmitter.__proto__ = ($__super !== null ? $__super : Function.prototype);
    FrameEmitter.prototype = $__Object$create(($__super !== null ? $__super.prototype : null));

    $__Object$defineProperty(FrameEmitter.prototype, "constructor", {
        value: FrameEmitter
    });

    $__Object$defineProperty(FrameEmitter.prototype, "_processBuffer", {
        value: function() {
            // TODO: filter garbage at front of buffer (anything not 0x00, 0x00, 0xFF at start?)

            logger.debug('processing buffer', util.inspect(this.buffer));

            if (Frame.isFrame(this.buffer)) {
                logger.debug('Frame found in buffer', util.inspect(this.buffer));

                var frame = Frame.fromBuffer(this.buffer);
                this.emit('frame', frame);

                if (frame instanceof ErrorFrame) {
                    logger.error('ErrorFrame found in buffer', util.inspect(frame));
                    this.emit('error', frame);
                } else if (frame instanceof DataFrame) {
                    logger.debug('DataFrame found in buffer', util.inspect(frame));
                    this.emit('response', frame);
                }

                this.buffer = this.buffer.slice(frame.getFrameLength()); // strip off frame's data from buffer

                // If more data still on buffer, process buffer again,
                // otherwise next 'data' event on serial will process the buffer after more data is receive
                if (this.buffer.length) {
                    this._processBuffer();
                }
            }
        },

        enumerable: false,
        writable: true
    });

    return FrameEmitter;
}(EventEmitter);

exports.FrameEmitter = FrameEmitter;
