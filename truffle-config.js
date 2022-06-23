const path = require("path");
const HDWalletProvider = require("@truffle/hdwallet-provider");

require("dotenv").config({path: "../.env"});
const AccountIndex = 0;

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),

  networks: {
    develop: {
      port: 8545
    },

    ropsten_Infura: {
      networkCheckTimeout: 100000,
      imeoutBlocks: 200,
      provider: function() {
        return new HDWalletProvider({
          mnemonic: process.env.Mneumonic,
          providerOrUrl: "wss://ropsten.infura.io/ws/v3/640d9a678d684d5e9a5896df9209f504",
          addressIndex: AccountIndex
      });
      },
      network_id: 3,
    },

    //Used to connect to Ganache
    ganacheDevelop: {
      port: 7545,
      host: "127.0.0.1",
      network_id: 5777
     },

    injectedWeb3Ganache: {
      provider: function() {
        return new HDWalletProvider({
          mnemonic: process.env.Mneumonic,
          providerOrUrl: "HTTP://127.0.0.1:7545",
          addressIndex: AccountIndex
      });
    },
      network_id: 5777
    }

  },
  compilers: {
    solc: {
      version: "0.8.13"
    }
  },

  plugins: [
    'truffle-plugin-verify',
    "truffle-contract-size"
  ],
  api_keys: {
    etherscan: process.env.etherscanApiKey
  }
};
