# PN532

Driver for the PN532 NFC chip.  Provides a promise-based API, and requires either:
- [node-serialport](https://github.com/voodootikigod/node-serialport)
- [node-i2c](https://github.com/kelly/node-i2c)

This implementation does not require libnfc, and should work on both X86 (32-bit or 64-bit) and ARM (RPi / Beaglebone) systems

Testing on a Mac OSX 10.9 system using UART/FTDI cable to an [Adafruit breakout board](https://www.adafruit.com/products/364)
and on a BeagleBone using UART.  I2C support is currently untested at the moment.

API is subject to change until the 1.0.0 release

### Links
- [Datasheet](http://www.nxp.com/documents/short_data_sheet/PN532_C1_SDS.pdf)
- [User manual](http://www.nxp.com/documents/user_manual/141520.pdf)

### Example

#### UART (using [node-serialport](https://github.com/voodootikigod/node-serialport))
```js
var pn532 = require('pn532');
var SerialPort = require('serialport').SerialPort;

var serialPort = new SerialPort('/dev/tty.usbserial-AFWR836M', { baudrate: 115200 });
var rfid = new pn532.PN532(serialPort);
```

#### I2C (using [node-i2c](https://github.com/kelly/node-i2c))
```js
var pn532 = require('pn532');
var i2c = require('i2c');

var wire = new i2c(pn532.I2C_ADDRESS, {device: '/dev/i2c-1'});
var pn532 = new pn532.PN532(wire);
```

#### Actively poll for NFC tag/card
```js
rfid.on('ready', function() {
    console.log('Listening for a card scan...');
    rfid.on('card', function(data) {
        console.log(Date.now(), 'card:', data.uid);
    });
});
```

#### Getting the firmware version (using Promises)
```js
rfid.on('ready', function() {
    rfid.getFirmwareVersion().then(function(data) {
        console.log('firmware: ', data);
    });
});
```


### Debug logging
`PN532_LOGGING=debug node dist/example.js`
