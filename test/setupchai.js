"use strict";
var chai = require("chai");
const BN = web3.utils.BN;

const chaiBN = require("chai-bn")(BN);
chai.use(chaiBN);

const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const chaiBytesImport = require("chai-bytes");
chai.use(chaiBytesImport)

//Config settings
chai.config.truncateThreshold = 0;

module.exports = chai;