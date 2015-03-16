var pn532 = require('../src/pn532');
var SerialPort = require('serialport').SerialPort;

var serialPort = new SerialPort('/dev/tty.usbserial-AFWR836M', { baudrate: 115200 });
var rfid = new pn532.PN532(serialPort);
var ndef = require('ndef');

console.log('Waiting for rfid ready event...');
rfid.on('ready', function() {

    console.log('Emulating tag...');
    rfid.emulateTag().then(function(data) {
        console.log('data', data);

        rfid.emulateGetData().then(function(data) {
            console.log('emulate get data', data);

        })
    });
});
