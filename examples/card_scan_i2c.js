var pn532 = require('../src/pn532');
var i2c = require('i2c-bus');

var bus = i2c.openSync(1);

var rfid = new pn532.PN532(bus);

console.log('Waiting for rfid ready event...');
rfid.on('ready', function() {
    console.log('Listening for a tag scan...');
    rfid.on('tag', function(tag) {
        console.log(Date.now(), 'UID:', tag.uid);
    });
});
