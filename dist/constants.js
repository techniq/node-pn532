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
exports.COMMAND_GET_FIRMWARE_VERSION = 0x02;
exports.COMMAND_GET_GENERAL_STATUS   = 0x04;
exports.COMMAND_READ_REGISTER        = 0x06;
exports.COMMAND_WRITE_REGISTER       = 0x08;
exports.COMMAND_READ_GPIO            = 0x0C;
exports.COMMAND_WRITE_GPIO           = 0x0E;
exports.COMMAND_SAMCONFIGURATION     = 0x14;
exports.COMMAND_POWER_DOWN           = 0x16;
exports.COMMAND_INLISTPASSIVETARGET  = 0x4A;
exports.COMMAND_RFCONFIGURATION      = 0x32;
exports.COMMAND_INDATAEXCHANGE       = 0x40;
exports.COMMAND_INDESELECT           = 0x44;

// Frame Identifiers (TFI)
exports.DIRECTION_HOST_TO_PN532 = 0xD4;
exports.DIRECTION_TO_HOST       = 0xD5;

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
