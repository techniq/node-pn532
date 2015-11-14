'use strict';
/*
  PN532 User Manual
*/

// Typical PN532 address
exports.I2C_ADDRESS = 0x48 >> 1; // 7-bit address bit shifted to 8-bit (?)
// exports.I2C_READBIT = 0x01;
// exports.I2C_BUSY = 0x00;
// exports.I2C_READY = 0x01;
// exports.I2C_READYTIMEOUT = 20;

// Section 7 - Commands supported (page 65)
// Miscellaneous
exports.COMMAND_DIAGNOSE               = 0x00;
exports.COMMAND_GET_FIRMWARE_VERSION   = 0x02;
exports.COMMAND_GET_GENERAL_STATUS     = 0x04;
exports.COMMAND_READ_REGISTER          = 0x06;
exports.COMMAND_WRITE_REGISTER         = 0x08;
exports.COMMAND_READ_GPIO              = 0x0C;
exports.COMMAND_WRITE_GPIO             = 0x0E;
exports.COMMAND_SET_SERIAL_BAUD_RATE   = 0x10;
exports.COMMAND_SET_PARAMETERS         = 0x12;
exports.COMMAND_SAMCONFIGURATION       = 0x14;
exports.COMMAND_POWER_DOWN             = 0x16;
// RF Communicaions
exports.COMMAND_RF_CONFIGUATION        = 0x32;
exports.COMMAND_RF_REGULATION_TEST     = 0x58;
// Initiator
exports.COMMAND_IN_JUMP_FOR_DEP        = 0x56;
exports.COMMAND_IN_JUMP_FOR_PSL        = 0x46;
exports.COMMAND_IN_LIST_PASSIVE_TARGET = 0x4A;
exports.COMMAND_IN_ATR                 = 0x50;
exports.COMMAND_IN_PSL                 = 0x4E;
exports.COMMAND_IN_DATA_EXCHANGE       = 0x40;
exports.COMMAND_IN_COMMUNICATE_THRU    = 0x42;
exports.COMMAND_IN_DESELECT            = 0x44;
exports.COMMAND_IN_RELEASE             = 0x52;
exports.COMMAND_IN_SELECT              = 0x54;
exports.COMMAND_IN_AUTO_POLL           = 0x60;
// Target
exports.TG_INIT_AS_TARGET              = 0x8C;
exports.TG_SET_GENERAL_BYTES           = 0x92;
exports.TG_GET_DATA                    = 0x86;
exports.TG_SET_DATA                    = 0x8E;
exports.TG_SET_META_DATA               = 0x94;
exports.TG_GET_INITIATOR_COMMAND       = 0x88;
exports.TG_RESPONSE_TO_INITIATOR       = 0x90;
exports.TG_GET_TARGET_STATUS           = 0x8A;

// Frame Identifiers (TFI)
exports.DIRECTION_HOST_TO_PN532        = 0xD4;
exports.DIRECTION_PN532_TO_HOST        = 0xD5;

// Values for PN532's SAMCONFIGURATION function.
exports.SAMCONFIGURATION_MODE_NORMAL       = 0x01;
exports.SAMCONFIGURATION_MODE_VIRTUAL_CARD = 0x02;
exports.SAMCONFIGURATION_MODE_WIRED_CARD   = 0x03;
exports.SAMCONFIGURATION_MODE_DUAL_CARD    = 0X04;

exports.SAMCONFIGURATION_TIMEOUT_50MS = 0x01;

exports.SAMCONFIGURATION_IRQ_OFF = 0x00;
exports.SAMCONFIGURATION_IRQ_ON  = 0x01;

// Values for the PN532's RFCONFIGURATION function.
exports.RFCONFIGURATION_CFGITEM_MAXRETRIES = 0x05;

// Section 7.3.5 (page 115)
exports.CARD_ISO14443A = 0x00; // 106 kbps type A (ISO/IEC14443 Type A)
exports.CARD_FELICA212 = 0x01; // 212 kbps (FeliCa polling)
exports.CARD_FELICA414 = 0x02; // 424 kbps (FeliCa polling)
exports.CARD_ISO14443B = 0x03; // 106 kbps type B (ISO/IEC14443-3B)
exports.CARD_JEWEL     = 0x04; // 106 kbps Innovision Jewel tag

exports.MIFARE_COMMAND_AUTH_A   = 0x60;
exports.MIFARE_COMMAND_AUTH_B   = 0x61;
exports.MIFARE_COMMAND_READ     = 0x30;
exports.MIFARE_COMMAND_WRITE_4 = 0xA2;
exports.MIFARE_COMMAND_WRITE_16 = 0xA0;

exports.TAG_MEM_NULL_TLV        = 0x00;
exports.TAG_MEM_LOCK_TLV        = 0x01;
exports.TAG_MEM_MEMCONTROL_TLV  = 0x02;
exports.TAG_MEM_NDEF_TLV        = 0x03;
exports.TAG_MEM_PROPRIETARY_TLV = 0xFD;
exports.TAG_MEM_TERMINATOR_TLV  = 0xFE;
