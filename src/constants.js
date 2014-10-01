/*
  PN532 User Manual
*/

// var I2C_READBIT = 0x01;
// var I2C_BUSY = 0x00;
// var I2C_READY = 0x01;
// var I2C_READYTIMEOUT = 20;
// var HOSTTOPN532 = 0xD4;

// Typical PN532 address
export var I2C_ADDRESS = 0x48 >> 1; // 7-bit address bit shifted to 8-bit (?)

// Section 7 - Commands supported (page 65)
export var COMMAND_GET_FIRMWARE_VERSION = 0x02;
export var COMMAND_GET_GENERAL_STATUS = 0x04;
export var COMMAND_READ_REGISTER = 0x06;
export var COMMAND_WRITE_REGISTER = 0x08;
export var COMMAND_READ_GPIO = 0x0C;
export var COMMAND_WRITE_GPIO = 0x0E;
export var COMMAND_SAMCONFIGURATION = 0x14;
export var COMMAND_POWER_DOWN = 0x16;
export var COMMAND_INLISTPASSIVETARGET = 0x4A;
export var COMMAND_RFCONFIGURATION = 0x32;
export var COMMAND_INDATAEXCHANGE = 0x40;
export var COMMAND_INDESELECT = 0x44;

// Frame Identifiers (TFI)
export var DIRECTION_HOST_TO_PN532 = 0xD4;
export var DIRECTION_TO_HOST = 0xD5;

// Values for PN532's SAMCONFIGURATION function.
export var SAMCONFIGURATION_MODE_NORMAL = 0x01;
export var SAMCONFIGURATION_MODE_VIRTUAL_CARD = 0x02;
export var SAMCONFIGURATION_MODE_WIRED_CARD = 0x03;
export var SAMCONFIGURATION_MODE_DUAL_CARD = 0X04;

export var SAMCONFIGURATION_TIMEOUT_50MS = 0x01;

export var SAMCONFIGURATION_IRQ_OFF = 0x00;
export var SAMCONFIGURATION_IRQ_ON = 0x01;

// Values for the PN532's RFCONFIGURATION function.
export var RFCONFIGURATION_CFGITEM_MAXRETRIES = 0x05;

// Section 7.3.5 (page 115)
export var CARD_ISO14443A = 0x00; // 106 kbps type A (ISO/IEC14443 Type A)
export var CARD_FELICA212 = 0x01; // 212 kbps (FeliCa polling)
export var CARD_FELICA414 = 0x02; // 424 kbps (FeliCa polling)
export var CARD_ISO14443B = 0x03; // 106 kbps type B (ISO/IEC14443-3B)
export var CARD_JEWEL     = 0x04; // 106 kbps Innovision Jewel tag
