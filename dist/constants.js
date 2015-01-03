"use strict";

/*
  PN532 User Manual
*/

// Typical PN532 address
exports.I2C_ADDRESS = 72 >> 1; // 7-bit address bit shifted to 8-bit (?)
// exports.I2C_READBIT = 0x01;
// exports.I2C_BUSY = 0x00;
// exports.I2C_READY = 0x01;
// exports.I2C_READYTIMEOUT = 20;

// Section 7 - Commands supported (page 65)
exports.COMMAND_GET_FIRMWARE_VERSION = 2;
exports.COMMAND_GET_GENERAL_STATUS = 4;
exports.COMMAND_READ_REGISTER = 6;
exports.COMMAND_WRITE_REGISTER = 8;
exports.COMMAND_READ_GPIO = 12;
exports.COMMAND_WRITE_GPIO = 14;
exports.COMMAND_SAMCONFIGURATION = 20;
exports.COMMAND_POWER_DOWN = 22;
exports.COMMAND_INLISTPASSIVETARGET = 74;
exports.COMMAND_RFCONFIGURATION = 50;
exports.COMMAND_INDATAEXCHANGE = 64;
exports.COMMAND_INDESELECT = 68;

// Frame Identifiers (TFI)
exports.DIRECTION_HOST_TO_PN532 = 212;
exports.DIRECTION_TO_HOST = 213;

// Values for PN532's SAMCONFIGURATION function.
exports.SAMCONFIGURATION_MODE_NORMAL = 1;
exports.SAMCONFIGURATION_MODE_VIRTUAL_CARD = 2;
exports.SAMCONFIGURATION_MODE_WIRED_CARD = 3;
exports.SAMCONFIGURATION_MODE_DUAL_CARD = 4;

exports.SAMCONFIGURATION_TIMEOUT_50MS = 1;

exports.SAMCONFIGURATION_IRQ_OFF = 0;
exports.SAMCONFIGURATION_IRQ_ON = 1;

// Values for the PN532's RFCONFIGURATION function.
exports.RFCONFIGURATION_CFGITEM_MAXRETRIES = 5;

// Section 7.3.5 (page 115)
exports.CARD_ISO14443A = 0; // 106 kbps type A (ISO/IEC14443 Type A)
exports.CARD_FELICA212 = 1; // 212 kbps (FeliCa polling)
exports.CARD_FELICA414 = 2; // 424 kbps (FeliCa polling)
exports.CARD_ISO14443B = 3; // 106 kbps type B (ISO/IEC14443-3B)
exports.CARD_JEWEL = 4; // 106 kbps Innovision Jewel tag