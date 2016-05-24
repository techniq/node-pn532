var pn532 = require('../src/pn532');
// var SerialPort = require('serialport').SerialPort;
var i2c = require('i2c-bus');

// var serialPort = new SerialPort('/dev/ttyAMA0', { baudrate: 115200 });
var bus = i2c.openSync(1);
bus.scan(function(err, devices) {
  console.log(err, devices)
});