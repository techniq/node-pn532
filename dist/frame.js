var $__Object$getPrototypeOf = Object.getPrototypeOf;
var $__Object$create = Object.create;
var $__Object$defineProperty = Object.defineProperty;
var c = require('./constants');
var PREAMBLE     = 0x00;
var START_CODE_1 = 0x00;
var START_CODE_2 = 0xFF;
var POSTAMBLE    = 0x00;

var Frame = function() {
    "use strict";
    function Frame() {}

    $__Object$defineProperty(Frame.prototype, "getFrameLength", {
        value: function() {
            throw new Error('Implement in subclass');
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(Frame.prototype, "toBuffer", {
        value: function() {
            throw new Error('Implement in subclass');
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(Frame, "fromBuffer", {
        value: function(buffer) {
            if (AckFrame.isFrame(buffer)) {
                return new AckFrame();
            }

            if (NackFrame.isFrame(buffer)) {
                return new NackFrame();
            }

            if (ErrorFrame.isFrame(buffer)) {
                return new ErrorFrame();
            }

            if (DataFrame.isFrame(buffer)) {
                return new DataFrame(buffer);
            }

            throw new Error('Invalid Response');
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(Frame, "isFrame", {
        value: function(buffer) {
            return DataFrame.isFrame(buffer) ||
                   AckFrame.isFrame(buffer) ||
                   NackFrame.isFrame(buffer) ||
                   ErrorFrame.isFrame(buffer);
        },

        enumerable: false,
        writable: true
    });

    return Frame;
}();

var DataFrame = function($__super) {
    "use strict";

    function DataFrame(data, direction) {
        if (data instanceof Buffer) {
            var buffer = data;

            var dataLength = buffer[3];
            var dataStart = 6;
            var dataEnd = dataStart + dataLength;
            var d = new Buffer(dataLength);
            buffer.copy(d, 0, dataStart, dataEnd);

            this._data = d;
            this.direction = buffer[5];
        } else if (data instanceof Array) {
            this._data = data;
            this._direction = direction || c.DIRECTION_HOST_TO_PN532;
        } else {
            throw new Error('data must be an instanceof a Buffer or Array');
        }
    }

    DataFrame.__proto__ = ($__super !== null ? $__super : Function.prototype);
    DataFrame.prototype = $__Object$create(($__super !== null ? $__super.prototype : null));

    $__Object$defineProperty(DataFrame.prototype, "constructor", {
        value: DataFrame
    });

    $__Object$defineProperty(DataFrame.prototype, "getDirection", {
        value: function() {
            return this._direction;
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(DataFrame.prototype, "getData", {
        value: function() {
            return this._data;
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(DataFrame.prototype, "getDataCommand", {
        value: function() {
            return this._data[0];
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(DataFrame.prototype, "getDataBody", {
        value: function() {
            return this._data.slice(1);
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(DataFrame.prototype, "getDataLength", {
        value: function() {
            return this._data.length + 1;
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(DataFrame.prototype, "getDataLengthChecksum", {
        value: function() {
            return (~this.getDataLength() & 0xFF) + 0x01;
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(DataFrame.prototype, "getDataChecksum", {
        value: function() {
            var dataCopy = this._data.slice();
            dataCopy.push(this._direction);

            var sum = dataCopy.reduce(function(prev, current) {
                return prev + current;
            });
            var inverse = (~sum & 0xFF) + 0x01;

            if (inverse > 255) {
                inverse = inverse - 255;
            }

            return inverse;
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(DataFrame.prototype, "getFrameLength", {
        value: function() {
            var frameLengthMinusData = 7;
            return this._data.length + frameLengthMinusData;
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(DataFrame.prototype, "toBuffer", {
        value: function() {
            var array = [].concat([
                PREAMBLE,
                START_CODE_1,
                START_CODE_2,
                this.getDataLength(),
                this.getDataLengthChecksum(),
                this.getDirection()
            ],  this._data, [
                this.getDataChecksum(),
                POSTAMBLE
            ]);
            return new Buffer(array);
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(DataFrame, "isFrame", {
        value: function(buffer) {
            // Checks if a buffer from the PN532 is valid.
            var frameLengthMinusData = 7;
            if (buffer.length <= frameLengthMinusData) {
                return false;
            }

            var dataLength = buffer[3];
            var validFrameLength = frameLengthMinusData + dataLength;
            if (buffer.length < validFrameLength) {
                return false;
            }

            // TODO: Check LCS and DCS checksums

            return (buffer[0] === PREAMBLE &&
                    buffer[1] === START_CODE_1 &&
                    buffer[2] === START_CODE_2 &&
                    buffer[validFrameLength - 1] === 0x00);
        },

        enumerable: false,
        writable: true
    });

    return DataFrame;
}(Frame);

var AckFrame = function($__super) {
    "use strict";

    function AckFrame() {
        $__Object$getPrototypeOf(AckFrame.prototype).constructor.call(this);
    }

    AckFrame.__proto__ = ($__super !== null ? $__super : Function.prototype);
    AckFrame.prototype = $__Object$create(($__super !== null ? $__super.prototype : null));

    $__Object$defineProperty(AckFrame.prototype, "constructor", {
        value: AckFrame
    });

    $__Object$defineProperty(AckFrame.prototype, "getFrameLength", {
        value: function() {
            return 6;
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(AckFrame.prototype, "toBuffer", {
        value: function() {
            return new Buffer([
                PREAMBLE,
                START_CODE_1,
                START_CODE_2,
                0x00,
                0xFF,
                POSTAMBLE
            ]);
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(AckFrame, "isFrame", {
        value: function(buffer) {
            // Checks if the buffer is an ACK frame. [00 00 FF 00 FF 00]
            return (buffer.length >= 6 &&
                    buffer[0] === PREAMBLE &&
                    buffer[1] === START_CODE_1 &&
                    buffer[2] === START_CODE_2 &&
                    buffer[3] === 0x00 &&
                    buffer[4] === 0xFF &&
                    buffer[5] === POSTAMBLE);
        },

        enumerable: false,
        writable: true
    });

    return AckFrame;
}(Frame);

var NackFrame = function($__super) {
    "use strict";

    function NackFrame() {
        $__Object$getPrototypeOf(NackFrame.prototype).constructor.call(this);
    }

    NackFrame.__proto__ = ($__super !== null ? $__super : Function.prototype);
    NackFrame.prototype = $__Object$create(($__super !== null ? $__super.prototype : null));

    $__Object$defineProperty(NackFrame.prototype, "constructor", {
        value: NackFrame
    });

    $__Object$defineProperty(NackFrame.prototype, "getFrameLength", {
        value: function() {
            return 6;
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(NackFrame.prototype, "toBuffer", {
        value: function() {
            return new Buffer([
                PREAMBLE,
                START_CODE_1,
                START_CODE_2,
                0xFF,
                0x00,
                POSTAMBLE
            ]);
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(NackFrame, "isFrame", {
        value: function(buffer) {
            // Checks if the buffer is an NACK frame. [00 00 FF FF 00 00]
            return (buffer.length >= 6 &&
                    buffer[0] === PREAMBLE &&
                    buffer[1] === START_CODE_1 &&
                    buffer[2] === START_CODE_2 &&
                    buffer[3] === 0xFF &&
                    buffer[4] === 0x00 &&
                    buffer[5] === POSTAMBLE);

        },

        enumerable: false,
        writable: true
    });

    return NackFrame;
}(Frame);

var ErrorFrame = function($__super) {
    "use strict";

    function ErrorFrame() {
        $__Object$getPrototypeOf(ErrorFrame.prototype).constructor.call(this, [0x7F]);
    }

    ErrorFrame.__proto__ = ($__super !== null ? $__super : Function.prototype);
    ErrorFrame.prototype = $__Object$create(($__super !== null ? $__super.prototype : null));

    $__Object$defineProperty(ErrorFrame.prototype, "constructor", {
        value: ErrorFrame
    });

    $__Object$defineProperty(ErrorFrame.prototype, "toBuffer", {
        value: function() {
            return new Buffer([
                PREAMBLE,
                START_CODE_1,
                START_CODE_2,
                0x01,    // Packet length
                0xFF,    // Packet length checksum
                0x7F,    // Specific application level error code
                0x81,    // Packet data checksum
                POSTAMBLE
            ]);
        },

        enumerable: false,
        writable: true
    });

    $__Object$defineProperty(ErrorFrame, "isFrame", {
        value: function(buffer) {
            //  Checks if the buffer is an error frame. [00 00 FF 01 FF 7F 81 00]
            return (buffer.length >= 8 &&
                    buffer[0] === PREAMBLE &&
                    buffer[1] === START_CODE_1 &&
                    buffer[2] === START_CODE_2 &&
                    buffer[3] === 0x01 && // Packet length
                    buffer[4] === 0xFF && // Packet length checksum
                    buffer[5] === 0x7F && // Specific application level error code
                    buffer[6] === 0x81 && // Packet data checksum
                    buffer[7] === POSTAMBLE);
        },

        enumerable: false,
        writable: true
    });

    return ErrorFrame;
}(DataFrame);

exports.Frame = Frame;
exports.DataFrame = DataFrame;
exports.AckFrame = AckFrame;
exports.NackFrame = NackFrame;
exports.ErrorFrame = ErrorFrame;
