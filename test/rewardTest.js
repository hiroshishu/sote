let Web3 = require('web3');
let BN = require('bignumber.js');
const rewardsToken = artifacts.require("Erc20Standrad");
const stakingToken = artifacts.require("Erc20Standrad");
const soteriaRewards = artifacts.require("SoteriaRewards");

contract('soteria', (accounts) => {
  

  it('自动化挖矿合约测试', async () => {
    // 矿币rewardsToken 和 抵押挖矿币 stakingToken
    rewards = await rewardsToken.deployed();
    staking = await stakingToken.deployed();
    soteria = await soteriaRewards.deployed();

    console.log("矿币rewardsToken合约地址："+rewards.address);
    console.log("抵押挖矿币stakingToken合约地址："+staking.address);

    // 铸造100个币用于挖矿
    await staking.mint(accounts[0],new BN("100000000000000000000"));
    const balance = await rewards.balanceOf(accounts[0]);
    assert.equal(balance.toString(),"100000000000000000000", "铸造10000测试币");

    console.log("挖矿合约地址："+soteria.address);

    soteriarewardsToken = await soteria.rewardsToken();
    assert.equal(soteriarewardsToken, rewards.address, "挖矿合约中rewardsToken地址匹配");

    await staking.approve(soteria.address,100);
    allow = await staking.allowance(accounts[0],soteria.address);

    assert.equal(allow.toNumber(), 100, "approve数量一致");

    // [挖矿测试] 1. 转账10000个币到挖矿合约
    await rewards.mint(accounts[0],new BN("10000000000000000000000"));
    // 直接向合约转账挖矿币
    await rewards.transfer(soteria.address,new BN("10000000000000000000000"));
    // 查询挖矿合约是否到账
    number = await rewards.balanceOf(soteria.address);
    console.log("挖矿币到账："+number.toString())

    // [挖矿测试] 2. 开启挖矿  抽水账号 35% 和 15% 比例
    cAddr1 = "0x6Ecbe1DB9EF729CBe972C83Fb886247691Fb6beb";
    cAddr2 = "0x78dc5D2D739606d31509C31d654056A45185ECb6";
    await soteria.start([cAddr1,cAddr2],[35,15]);

  });


});
