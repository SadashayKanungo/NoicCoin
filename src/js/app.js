var loader = $('#loader'), content = $('#content');

App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 0,
  tokensSold: 0,
  tokensAvailable: 750000,
  balance: 0,

  init: function() {
    window.ethereum.enable();
    console.log("App initialized...")
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = window.ethereum;
      web3 = new Web3(window.ethereum);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },

  initContracts: function() {
    $.getJSON("./NoicSale.json", function(noicsale) {
      App.contracts.NoicSale = TruffleContract(noicsale);
      App.contracts.NoicSale.setProvider(App.web3Provider);
      App.contracts.NoicSale.deployed().then(function(contract) {
        console.log("Noic Coin Sale Address:", contract.address);
      });
    }).done(function() {
      $.getJSON("./NoicCoin.json", function(noiccoin) {
        App.contracts.NoicCoin = TruffleContract(noiccoin);
        App.contracts.NoicCoin.setProvider(App.web3Provider);
        App.contracts.NoicCoin.deployed().then(function(contract) {
          console.log("Noic Coin Address:", contract.address);
        });
        
        App.listenForEvents();
        return App.render();
      });
    })
  },

  listenForEvents: function(){
    App.contracts.NoicSale.deployed().then(function(instance){
      instance.Sale({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event){
        console.log("Sale event triggered", event);
        App.render();
      })
    })
    App.contracts.NoicCoin.deployed().then(function(instance){
      instance.Transfer({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event){
        console.log("Transfer event triggered", event);
        App.render();
      })
    })
  },

  render: function(){
    if(App.loading){
      return;
    }
    App.loading = true;
    
    loader.show();
    content.hide();

    web3.eth.getCoinbase(function(err,account){
      if(err==null){
        console.log("Account : " + account);
        App.account = account;
        $('#accountAddress').html(account);
      }
      else{
        console.log('Account error', err);
      }
      
      App.loading = false;
      loader.hide();
      content.show();
    })

    App.contracts.NoicSale.deployed().then(function(instance){
      saleInstance = instance;
      return saleInstance.tokenPrice();
    }).then(function(tokenPrice){
      App.tokenPrice = tokenPrice;
      $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber())
      return saleInstance.tokensSold();
    }).then(function(tokensSold){
      App.tokensSold = tokensSold.toNumber();
      $('.tokens-sold').html(App.tokensSold);
      $('.tokens-available').html(App.tokensAvailable);

      var progress = Math.ceil((App.tokensSold/App.tokensAvailable)*100);
      $('#progress').css('width', progress+'%');
    })

    App.contracts.NoicCoin.deployed().then(function(instance){
      coinInstance = instance;
      return coinInstance.balanceOf(App.account);
    }).then(function(balance){
      App.balance = balance;
      $('.balance').html(App.balance.toNumber())
    })
  },

  buyTokens: function(){
    content.hide();
    loader.show();
    var numberOfTokens = $('#numberOfTokens').val();

    App.contracts.NoicSale.deployed().then(function(instance){
      return instance.buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gas: 500000
      });
    }).then(function(result){
      console.log("Tokens bought");
      $('form').trigger('reset');
    })
  },

  transferTokens: function(){
    content.hide();
    loader.show();
    var numberOfTokensToTransfer = $('#numberOfTokensToTransfer').val();
    var addressToTransfer = $('#addressToTransfer').val();

    App.contracts.NoicCoin.deployed().then(function(instance){
      return instance.transfer(addressToTransfer, numberOfTokensToTransfer, {
        from: App.account,
        value: "0x0",
        gas: 500000
      });
    }).then(function(result){
      console.log("Tokens transfered");
      $('form').trigger('reset');
    })
  }
}




$(function() {
  $(window).load(function() {
    alert("Connect to the website from your Metamask Wallet and switch to the Rinkeby Test Network");
    App.init();
  })
});
