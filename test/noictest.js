var NoicCoin = artifacts.require("./noiccoin.sol");

contract('NoicCoin', function(accounts){
    it('sets name and symbol', function(){
        return NoicCoin.deployed().then( function(instance){
            tokenInstance = instance;
            return tokenInstance.name();
        }).then(function(name){
            assert.equal(name, "NOIC COIN", 'has correct name');
            return tokenInstance.symbol();
        }).then(function(symbol){
            assert.equal(symbol, "NOIC", 'has correct symbol');
            return tokenInstance.standard();
        }).then(function(standard){
            assert.equal(standard, "NOIC COIN v1.0", 'has correct symbol');
        })
    })

    it('sets the total supply and allocates it to admin', function(){
        return NoicCoin.deployed().then( function(instance){
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then(function(totalSupply){
            assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1,000,000');
            return tokenInstance.balanceOf(accounts[0]); 
        }).then(function (adminBalance){
            assert.equal(adminBalance.toNumber(), 1000000, 'allocates initial supply to admin account')
        })
    })

    it('transfers token ownership', function(){
        return NoicCoin.deployed().then( function(instance){
            tokenInstance = instance;
            return tokenInstance.transfer.call(accounts[1], 9999999, {from:accounts[0]});
        }).then(assert.fail).catch(function(error){
            //console.log(error);
            //assert(error.message.indexOf('revert') >= 0, 'error message for value out of bounds contains revert');
            return tokenInstance.transfer.call(accounts[1], 100, {from:accounts[0]} );
        }).then(function(success){
            assert.equal(success, true, 'should return true');
            return tokenInstance.transfer(accounts[1], 100, {from:accounts[0]} );
        }).then(function(receipt){        
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
            assert.equal(receipt.logs[0].args._from, accounts[0], 'should be from acc0');
            assert.equal(receipt.logs[0].args._to, accounts[1], 'should be to acc1');
            assert.equal(receipt.logs[0].args._value, 100, 'should be of value 100');
            return tokenInstance.balanceOf(accounts[1]);
        }).then(function(toBalance){
            assert.equal(toBalance, 100, 'receiver balance is correct');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(fromBalance){
            assert.equal(fromBalance, 999900, 'sender balance is correct');
        })
    })

    it('approves tokens for delegated transfer', function(){
        return NoicCoin.deployed().then(function(instance){
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1], 100);
        }).then(function(success){
            assert.equal(success, true, 'should return true');
            return tokenInstance.approve(accounts[1], 100, {from: accounts[0]} );
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Approval', 'should be the Approval event');
            assert.equal(receipt.logs[0].args._owner, accounts[0], 'should be from acc0');
            assert.equal(receipt.logs[0].args._spender, accounts[1], 'should be to acc1');
            assert.equal(receipt.logs[0].args._value, 100, 'should be of value 100');
            return tokenInstance.allowance(accounts[0], accounts[1]);
        }).then(function(allowance){
            assert.equal(allowance, 100, 'stores the allowance for delegated transfer');
        })
    })

    it('handles delegated transfer', function(){
        return NoicCoin.deployed().then(function(instance){
            tokenInstance = instance;
            fromAcc = accounts[2];
            toAcc = accounts[3];
            spendingAcc = accounts[4];
            return tokenInstance.transfer(fromAcc, 1000, {from:accounts[0]});
        }).then(function(receipt){
            return tokenInstance.approve(spendingAcc, 100, {from:fromAcc});
        }).then(function(receipt){
            return tokenInstance.transferFrom.call(fromAcc, toAcc, 999, {from:spendingAcc});
        }).then(assert.fail).catch(function(error){
            //console.log(error);
            //assert(error.message.indexOf('revert') >=0, 'cannot transfer value larger then allowance');
            return tokenInstance.transferFrom(fromAcc, toAcc, 10, {from:spendingAcc});
        }).then(function(receipt){
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the Transfer event');
            assert.equal(receipt.logs[0].args._from, fromAcc, 'should be from fromAcc');
            assert.equal(receipt.logs[0].args._to, toAcc, 'should be to toAcc');
            assert.equal(receipt.logs[0].args._value, 10, 'should be of value 10');
            return tokenInstance.balanceOf(toAcc);
        }).then(function(toBalance){
            assert.equal(toBalance, 10, 'receiver balance is correct');
            return tokenInstance.balanceOf(fromAcc);
        }).then(function(fromBalance){
            assert.equal(fromBalance, 990, 'sender balance is correct');
            return tokenInstance.allowance(fromAcc, spendingAcc);
        }).then(function(allowance){
            assert.equal(allowance, 90, 'allowance is correct');
        })
    })
})