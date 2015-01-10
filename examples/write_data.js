var pn532 = require('../src/pn532');
var SerialPort = require('serialport').SerialPort;

var serialPort = new SerialPort('/dev/tty.usbserial-AFWR836M', { baudrate: 115200 });
var rfid = new pn532.PN532(serialPort);
var ndef = require('ndef');

console.log('Waiting for rfid ready event...');
rfid.on('ready', function() {

    console.log('Waiting for a tag...');
    rfid.scanTag().then(function(tag) {
        console.log('Tag found:', tag);

        var messages = [
            ndef.uriRecord('http://www.google.com'),
            ndef.textRecord('test')
        ];
        var data = ndef.encodeMessage(messages);

        console.log('Writing tag data...');
        rfid.writeNdefData(data).then(function(response) {
            console.log('Write successful');
        });
    });
});
