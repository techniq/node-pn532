var pn532 = require('./pn532');

var SerialPort = require('serialport').SerialPort;
var serialPort = new SerialPort('/dev/tty.usbserial-AFWR836M', { baudrate: 115200 });
var rfid = new pn532.PN532(serialPort);

rfid.on('ready', function() {
    // rfid.getFirmwareVersion().then(function(data) {
    //     console.log('firmware: ', data);
    // });

    // pn532.getGeneralStatus().then(function(data) {
    //     console.log('status: ', data);
    // });

    // pn532.readPassiveTargetId()
    //     .then(function(card) {
    //         if (card)
    //             console.log('card: ', card);
    //     })
    //     .catch(function(error) {
    //         console.log('ERROR:', error);
    //     });

    console.log('Listening for a card scan...');
    rfid.on('card', function(data) {
        console.log(Date.now(), 'UID:', data.uid);
    });
});
