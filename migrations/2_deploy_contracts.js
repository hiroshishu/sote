const rewardsToken = artifacts.require("Erc20Standrad");
const stakingToken = artifacts.require("Erc20Standrad");
const soteriaRewards = artifacts.require("SoteriaRewards");

// ============ Main Migration ============

const migration = async (deployer, network, accounts) => {
  await Promise.all([
    deployToken(deployer, network, accounts),
  ]);
};

module.exports = migration;

async function deployToken(deployer, network, accounts) {
	// console.log(network);
  	await deployer.deploy(rewardsToken);
  	await deployer.deploy(stakingToken);
  	//部署reward合约,设置挖矿7天 = 604800秒
  	await deployer.deploy(soteriaRewards,stakingToken.address,accounts[0],rewardsToken.address,604800);

}
