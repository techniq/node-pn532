# PN532

Driver for the PN532 NFC chip.  Provides an event and promise-based API, and requires either:
- [node-serialport](https://github.com/voodootikigod/node-serialport)
- [node-i2c](https://github.com/kelly/node-i2c) (WIP)

This implementation does not require libnfc, and should work on both X86 (32-bit or 64-bit) and ARM (RPi / Beaglebone) systems

Tested on a Mac OSX 10.9 system using a UART/FTDI cable to an [Adafruit breakout board](https://www.adafruit.com/products/364)
and on a BeagleBone using UART.  I2C support is currently a WIP at the moment.

API is subject to change until the 1.0.0 release

### Install
    npm install pn532

and `npm install serialport` or `npm install i2c`

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
Tested using NTAG203 tags.  Should support other NTAG and Mifare Ultralight tags.  Mifare Classic tags are currently NOT supported, but could be in the future.

#### Read
```js
rfid.on('ready', function() {
    rfid.on('tag', function(tag) {
        rfid.readNdefData().then(function(data) {
            var records = ndef.decodeMessage(Array.from(data));
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
Examples are available under the `examples` directory

### Debug logging
`PN532_LOGGING=debug node examples/card_scan.js`

### Note for using UART on a Raspberry Pi 3
If you are using this library on a Raspberry Pi 3, you will likely encounter an [issue](https://github.com/techniq/node-pn532/issues/9) with the device sending or receiving data over UART due to some hardware and configuration changes with regards to the serial port.

TLDR workaround:
  1. Add `core_freq=250` in the `/boot/cmdline.txt`
  2. Use `/dev/ttyS0` instead of `/dev/ttyAMA0`

For details on why these changes are needed, see [here](http://elinux.org/RPi_Serial_Connection#Preventing_Linux_using_the_serial_port) and [here](https://blog.adafruit.com/2016/03/07/raspberry-pi-3-uart-speed-workaround/)

### Links
- [Datasheet](http://www.nxp.com/documents/short_data_sheet/PN532_C1_SDS.pdf)
- [User manual](http://www.nxp.com/documents/user_manual/141520.pdf)
