const NoicCoin = artifacts.require("./noiccoin.sol");
const NoicSale = artifacts.require("./noicsale.sol");

const tokensAvailable = 750000;
var admin = '';

web3.eth.getCoinbase(function(err,account){
  if(err==null){
    console.log("Admin : " + account);
    admin = account;
  }
  else{
    console.log('Account error', err);
  }
});

module.exports = function (deployer) {
  deployer.deploy(NoicCoin, 1000000)
  .then(function(){
    return deployer.deploy(NoicSale, NoicCoin.address, 1000000000000000);
  }).then(function(){
    NoicCoin.deployed().then(function(instance){
      return instance.transfer(NoicSale.address, tokensAvailable, {
        from: admin,
        value: "0x0",
        gas: 500000
      })
    })
  })
};
