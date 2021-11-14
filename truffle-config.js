const HDWalletProvider = require('@truffle/hdwallet-provider');
const infurakey = '59d92a75e49a473dab212bf2561d3780';
const fs = require('fs');
const mnemonic = fs.readFileSync(".secret").toString().trim();

module.exports = {
  networks: {
    development: {
     host: "127.0.0.1",
     port: 8545,
     network_id: "*",
    },
    rinkeby: {
      provider : () => new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/${infurakey}`),
      host: "localhost",
      port: 8545,
      network_id: 4,
      gas: 4700000
    }
  },
  compilers: {
    solc: {
      version: "^0.5.16",
      settings: {
        optimization: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
};
