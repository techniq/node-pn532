var pn532 = require('../src/pn532');
var SerialPort = require('serialport').SerialPort;

var serialPort = new SerialPort('/dev/tty.usbserial-AFWR836M', { baudrate: 115200 });
var rfid = new pn532.PN532(serialPort, { pollInterval: 3000 });
var ndef = require('ndef');

console.log('Waiting for rfid ready event...');
rfid.on('ready', function() {

    console.log('Listening for a tag scan...');
    rfid.on('tag', function(tag) {
        console.log('Tag', tag);

        console.log('Authenticating...');
        rfid.authenticateBlock(tag.uid).then(function() {
            console.log('Reading tag data...');
            rfid.readData().then(function(data) {
                console.log('Tag data:', data);

                var records = ndef.decodeMessage(data.toJSON());
                console.log(records);
            });
        });
    });
});
