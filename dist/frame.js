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

var c = require("./constants");

var PREAMBLE = 0;
var START_CODE_1 = 0;
var START_CODE_2 = 255;
var POSTAMBLE = 0;

/*
    Represents a single communication frame for communication with the PN532 NFC Chip.
*/
var Frame = function Frame() {};

// Gets the frame's data length
Frame.prototype.getFrameLength = function () {
  throw new Error("Implement in subclass");
};

// Convert Frame instance to a Buffer instance
Frame.prototype.toBuffer = function () {
  throw new Error("Implement in subclass");
};

Frame.fromBuffer = function (buffer) {
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

  throw new Error("Invalid Response");
};

Frame.isFrame = function (buffer) {
  return DataFrame.isFrame(buffer) || AckFrame.isFrame(buffer) || NackFrame.isFrame(buffer) || ErrorFrame.isFrame(buffer);
};

var DataFrame = (function () {
  var _Frame = Frame;
  var DataFrame = (
    /*
        Constructor
         @param {(bufer|array}} data - Complete packet data, or just the data portion of the package data
        @param {number} [direction=DIRECTION_HOST_TO_PN532] - Way of message (PN532 to HOST, or HOST to PN532.  See DIRECTION_* constants)
    */
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
        throw new Error("data must be an instanceof a Buffer or Array");
      }
    }
  );

  _inherits(DataFrame, _Frame);

  // Gets the frame's direction
  DataFrame.prototype.getDirection = function () {
    return this._direction;
  };

  // Gets the frame's data
  DataFrame.prototype.getData = function () {
    return this._data;
  };

  DataFrame.prototype.getDataCommand = function () {
    return this._data[0];
  };

  DataFrame.prototype.getDataBody = function () {
    return this._data.slice(1);
  };

  // Gets the frame's data length
  DataFrame.prototype.getDataLength = function () {
    return this._data.length + 1;
  };

  // Gets the checksum of getDataLength().
  DataFrame.prototype.getDataLengthChecksum = function () {
    return (~this.getDataLength() & 255) + 1;
  };

  // Gets a checksum for the frame's data.
  DataFrame.prototype.getDataChecksum = function () {
    var dataCopy = this._data.slice();
    dataCopy.push(this._direction);

    var sum = dataCopy.reduce(function (prev, current) {
      return prev + current;
    });
    var inverse = (~sum & 255) + 1;

    if (inverse > 255) {
      inverse = inverse - 255;
    }

    return inverse;
  };

  DataFrame.prototype.getFrameLength = function () {
    var frameLengthMinusData = 7;
    return this._data.length + frameLengthMinusData;
  };

  DataFrame.isFrame = function (buffer) {
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

    return buffer[0] === PREAMBLE && buffer[1] === START_CODE_1 && buffer[2] === START_CODE_2 && buffer[validFrameLength - 1] === 0;
  };

  DataFrame.prototype.toBuffer = function () {
    var array = [].concat([PREAMBLE, START_CODE_1, START_CODE_2, this.getDataLength(), this.getDataLengthChecksum(), this.getDirection()], this._data, [this.getDataChecksum(), POSTAMBLE]);
    return new Buffer(array);
  };

  return DataFrame;
})();

var AckFrame = (function () {
  var _Frame2 = Frame;
  var AckFrame = function AckFrame() {
    _Frame2.call(this);
  };

  _inherits(AckFrame, _Frame2);

  AckFrame.prototype.getFrameLength = function () {
    return 6;
  };

  AckFrame.isFrame = function (buffer) {
    // Checks if the buffer is an ACK frame. [00 00 FF 00 FF 00]
    return buffer.length >= 6 && buffer[0] === PREAMBLE && buffer[1] === START_CODE_1 && buffer[2] === START_CODE_2 && buffer[3] === 0 && buffer[4] === 255 && buffer[5] === POSTAMBLE;
  };

  AckFrame.prototype.toBuffer = function () {
    return new Buffer([PREAMBLE, START_CODE_1, START_CODE_2, 0, 255, POSTAMBLE]);
  };

  return AckFrame;
})();

var NackFrame = (function () {
  var _Frame3 = Frame;
  var NackFrame = function NackFrame() {
    _Frame3.call(this);
  };

  _inherits(NackFrame, _Frame3);

  NackFrame.prototype.getFrameLength = function () {
    return 6;
  };

  NackFrame.isFrame = function (buffer) {
    // Checks if the buffer is an NACK frame. [00 00 FF FF 00 00]
    return buffer.length >= 6 && buffer[0] === PREAMBLE && buffer[1] === START_CODE_1 && buffer[2] === START_CODE_2 && buffer[3] === 255 && buffer[4] === 0 && buffer[5] === POSTAMBLE;
  };

  NackFrame.prototype.toBuffer = function () {
    return new Buffer([PREAMBLE, START_CODE_1, START_CODE_2, 255, 0, POSTAMBLE]);
  };

  return NackFrame;
})();

var ErrorFrame = (function () {
  var _DataFrame = DataFrame;
  var ErrorFrame = function ErrorFrame() {
    _DataFrame.call(this, [127]);
  };

  _inherits(ErrorFrame, _DataFrame);

  ErrorFrame.isFrame = function (buffer) {
    //  Checks if the buffer is an error frame. [00 00 FF 01 FF 7F 81 00]
    return buffer.length >= 8 && buffer[0] === PREAMBLE && buffer[1] === START_CODE_1 && buffer[2] === START_CODE_2 && buffer[3] === 1 && ( // Packet length
      buffer[4] === 255
    ) && ( // Packet length checksum
      buffer[5] === 127
    ) && ( // Specific application level error code
      buffer[6] === 129
    ) && ( // Packet data checksum
      buffer[7] === POSTAMBLE
    );
  };

  ErrorFrame.prototype.toBuffer = function () {
    return new Buffer([PREAMBLE, START_CODE_1, START_CODE_2, 1, ( // Packet length
      255
    ), ( // Packet length checksum
      127
    ), ( // Specific application level error code
      129
    ), ( // Packet data checksum
      POSTAMBLE
    )]);
  };

  return ErrorFrame;
})();

exports.Frame = Frame;
exports.DataFrame = DataFrame;
exports.AckFrame = AckFrame;
exports.NackFrame = NackFrame;
exports.ErrorFrame = ErrorFrame;