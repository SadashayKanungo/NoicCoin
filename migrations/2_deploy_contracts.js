const NoicCoin = artifacts.require("./noiccoin.sol");
const NoicSale = artifacts.require("./noicsale.sol");

module.exports = function (deployer) {
  deployer.deploy(NoicCoin, 1000000)
  .then(function(){
    return deployer.deploy(NoicSale, NoicCoin.address, 1000000000000000);
  })
};
