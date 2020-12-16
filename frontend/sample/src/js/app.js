let BN = require('bignumber.js');

App = {
  account:null,
  web3Provider: null,
  contracts: {},
  counterInst: null,
  counterAddress:"0x43beb386288ad2f1e0e1b25D2b57579779EBE423",

  init: async function() {
    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);


    //显示当前钱包地址
    App.account = window.ethereum.selectedAddress;
    $("#wallet").html(App.account);
    $("#addr").html(App.counterAddress);

    return App.initContract();
  },

  initContract: function() {
    //1. 拿到合约编译好的abi文件内容，实例化合约
    $.getJSON('Counter.json', function(data) {
      var CounterArtifact = data;
      var counter = TruffleContract(CounterArtifact);
      counter.setProvider(App.web3Provider);
      // 2. 将部署的合约地址set到Counter合约实例中，这样当前web3实例就知道和以太坊网络上的哪个Counter合约进行交互。
      counter.at(App.counterAddress).then(function (instance) {
        App.counterInst = instance;

        // 3. 【读合约】直接查询合约中的 counter 数量
        instance.getCounter().then(function(amount) {
          // 4. 链上读合约拿到的结果在前端页面显示
          $('#rbalance').html(amount.toString());
        })
      });
      
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    //前端按钮绑定事件
    $(document).on('click', '#add1', App.handleAdd);
    $(document).on('click', '#sub1', App.handleSub);
  },

  // 【写合约】 5.发起metamask, 合约调用。 合约中counter进行+1
  handleAdd: function(event) {
    event.preventDefault();

    App.counterInst.add({from: App.account}).then(function () {
      // 6. 合约交易发送成功，并且调用合约监听事件成功后，刷新前端页面显示最新合约结果
      location.reload();
    });
  },

  // 【写合约】 合约中counter进行 -1
  handleSub: function(event) {
    event.preventDefault();

    App.counterInst.subtract({from: App.account}).then(function () {
      location.reload();
    });
  },

};



$(function() {
  $(window).load(function() {
    //metamask账户改变
    ethereum.on('accountsChanged', function (accounts) {
      App.account = accounts[0];
      $("#wallet").html(accounts[0]);
    });
    App.init();
  });
});
