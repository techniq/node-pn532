var pn532 = require('../src/pn532');
var Board = require('firmata');

console.log('Initializing firmata board...');
var board = new Board('/dev/tty.usbmodem1263141', function() {
    board.i2cConfig();
    var rfid = new pn532.PN532(board);
    
    console.log('Waiting for rfid ready event...');
    rfid.on('ready', function() {
        console.log('Listening for a tag scan...');
        rfid.on('tag', function(tag) {
            console.log(Date.now(), 'UID:', tag.uid);
        });
    });
}); 