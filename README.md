# PN532

Driver for the PN532 NFC chip.  Provides an event and promise-based API, and requires either:
- [node-serialport](https://github.com/voodootikigod/node-serialport)
- [node-i2c](https://github.com/kelly/node-i2c)

This implementation does not require libnfc, and should work on both X86 (32-bit or 64-bit) and ARM (RPi / Beaglebone) systems

Tested on a Mac OSX 10.9 system using a UART/FTDI cable to an [Adafruit breakout board](https://www.adafruit.com/products/364)
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
var rfid = new pn532.PN532(wire);
```

#### Scan a tag
```js
rfid.on('ready', function() {
    rfid.scanTag().then(function(tag) {
        console.log('tag:', tag.uid);
    });
});
```

#### Poll for a tag
```js
rfid.on('ready', function() {
    console.log('Listening for a tag scan...');
    rfid.on('tag', function(tag) {
        console.log('tag:', tag.uid);
    });
});
```

#### Retrieve the firmware version
```js
rfid.on('ready', function() {
    rfid.getFirmwareVersion().then(function(data) {
        console.log('firmware: ', data);
    });
});
```

### Read and write tag data (using [ndef library](https://www.npmjs.com/package/ndef))
Tested using NTAG203 tags.  Should support other NTAG and Mifare Ultralight tags.  Mifare Classic tags are currently NOT supported, but should be in the future.

#### Read
```js
rfid.on('ready', function() {
    rfid.on('tag', function(tag) {
        rfid.readNdefData().then(function(data) {
            var records = ndef.decodeMessage(data.toJSON());
            console.log(records);
        });
    });
});
```
#### Write
```js
rfid.on('ready', function() {
    rfid.scanTag().then(function(tag) {
        var messages = [
            ndef.uriRecord('http://www.google.com'),
            ndef.textRecord('test')
        ];
        var data = ndef.encodeMessage(messages);

        rfid.writeNdefData(data).then(function(response) {
            console.log('Write successful');
        });
    });
});
```

### Examples
Working examples are available under the `examples` directory.  They should be ran with `6to5-node filename.js`, or replace:

```js
var pn532 = require('../src/pn532');
```

with

```js
var pn532 = require('../dist/pn532');
```


### Debug logging
`PN532_LOGGING=debug node dist/example.js`
