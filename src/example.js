var PN532_HSU = require('./pn532_hsu');
var pn532 = new PN532_HSU('/dev/tty.usbserial-AFWR836M', { baudrate: 115200 });

pn532.on('ready', function() {
    // setInterval(function() {

        // pn532.getFirmwareVersion().then(function(data) {
        //     console.log('firmware: ', data);
        // });

        // pn532.getGeneralStatus().then(function(data) {
        //     console.log('status: ', data);
        // });

        pn532.readPassiveTargetId()
            .then(function(card) {
                if (card)
                    console.log('card: ', card);
            })
            .catch(function(error) {
                console.log('ERROR:', error);
            });
    // }, 1000)

    // pn532.on('cardRead', function(card) { ... });
});
