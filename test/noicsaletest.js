var NoicSale = artifacts.require('./noicsale.sol');
var NoicCoin = artifacts.require('./noiccoin.sol');

contract('NoicSale', function(accounts){
    var tokenSaleInstance;
    var tokenPrice = 1000000000000000;
    var tokensTotal = 1000000;
    var tokensAvailable = 750000;
    var buyer = accounts[1];
    var admin = accounts[0];
    var numberOfTokens = 10;

    it('initializes the contract with correct values', function(){
        return NoicSale.deployed().then(function(instance){
            tokenSaleInstance = instance;
            return tokenSaleInstance.address;
        }).then(function(address){
            assert.notEqual(address, 0x0, 'has sale contract address');
            return tokenSaleInstance.tokenContract();
        }).then(function(address){
            assert.notEqual(address, 0x0, 'has token contract address');
            return tokenSaleInstance.tokenPrice();
        }).then(function(price){
            assert.equal(price, tokenPrice, 'token price is correct');
        })
    })

    it('facilitates token buying', function(){
        return NoicCoin.deployed().then(function(instance){
            tokenInstance = instance;
            return NoicSale.deployed();
        }).then(function(instance){
            tokenSaleInstance = instance;
            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, {from:admin, })
        }).then(function(receipt){
            return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: numberOfTokens * tokenPrice});
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Sale', 'should be the Sale event');
            assert.equal(receipt.logs[0].args.buyer, buyer, 'should be sold to acc1');
            assert.equal(receipt.logs[0].args.amount, numberOfTokens, 'amount should be 10');
            return tokenSaleInstance.tokensSold();
        }).then(function(amount){
            assert.equal(amount.toNumber(), numberOfTokens, 'updates the number of tokens sold');
            return tokenInstance.balanceOf(buyer);
        }).then(function(amount){
            assert.equal(amount.toNumber(), numberOfTokens, 'buyer balance debited');
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then(function(amount){
            assert.equal(amount.toNumber(), tokensAvailable - numberOfTokens, 'contract balance credited');
        })
    })

    it('ends token sale', function(){
        return NoicCoin.deployed().then(function(instance){
            tokenInstance = instance;
            return NoicSale.deployed();
        }).then(function(instance){
            tokenSaleInstance = instance;
            return tokenSaleInstance.endSale({from:admin});
        }).then(function(receipt){
            return tokenInstance.balanceOf(admin);
        }).then(function(amount){
            assert.equal(amount.toNumber(), tokensTotal-numberOfTokens, "remaining tokens transfered to admin");
        })
    })
})