require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const log = require('./log');
const NexusContractLoader = require('./nexus-contract-loader');
const {sleep, getEnv, toBN, toHex} = require('./utils');

const GWEI_IN_WEI = 1e9;

const PRIVATE_KEY = getEnv(`PRIVATE_KEY`);
const PROVIDER_URL = getEnv(`PROVIDER_URL`);
const MINIMUM_CAPITAL_REQUIREMENT = toBN(getEnv(`MINIMUM_CAPITAL_REQUIREMENT`));
// 波动超过xxx个BNB则更新mcr
const MINIMUM_CAPITAL_UPDATE = toBN(getEnv(`MINIMUM_CAPITAL_UPDATE`));
const DEFAULT_ITERATIONS = parseInt(getEnv(`DEFAULT_ITERATIONS`));
const MAX_GAS = parseInt(getEnv(`MAX_GAS`));
const MAX_GAS_PRICE_GWEI = parseInt(getEnv(`MAX_GAS_PRICE_GWEI`));
const NETWORK = getEnv('NETWORK', 'mainnet').toLowerCase();
const versionDataURL = getEnv(`version_Data`);

const MAX_GAS_PRICE = MAX_GAS_PRICE_GWEI * GWEI_IN_WEI;

const provider = new HDWalletProvider(PRIVATE_KEY, PROVIDER_URL);
const [providerAddress] = provider.getAddresses();
const nexusContractLoader = new NexusContractLoader(NETWORK, versionDataURL, provider, providerAddress);
let pooledStaking;
let mcrInst;
let pdInst;
let maInst;
let clInst;
let qtInst;
const web3 = new Web3(PROVIDER_URL);


async function processPendingActions() {
  const hasPendingActions = await pooledStaking.hasPendingActions();

  if (!hasPendingActions) {
    log.info(`No pending actions present.`);
    return;
  }

  log.info(`Process pending actions.`);
  const {gasEstimate, iterations} = await getGasEstimateAndIterations(pooledStaking, DEFAULT_ITERATIONS, MAX_GAS);
  const gasPrice = toBN('20000000000');

  if (gasPrice > MAX_GAS_PRICE) {
    log.warn(`Gas price ${gasPrice} exceeds MAX_GAS_PRICE=${MAX_GAS_PRICE}. Not executing the the transaction at this time.`);
  }

  const increasedGasEstimate = Math.floor(gasEstimate * 1.3);
  const nonce = await web3.eth.getTransactionCount(providerAddress);
  log.info(JSON.stringify({iterations, gasEstimate, increasedGasEstimate, gasPrice, nonce}));

  const tx = await pooledStaking.processPendingActions(iterations, {
    gas: increasedGasEstimate,
    gasPrice,
    nonce,
  });

  log.info(`processPendingActions Gas used: ${tx.receipt.gasUsed}.`);
}

async function getGasEstimateAndIterations(pooledStaking, defaultIterations, maxGas) {
  let iterations = defaultIterations;
  let gasEstimate;
  while (true) {
    try {
      log.info(`Estimating gas for iterations=${iterations} and maxGas=${maxGas}`);
      gasEstimate = await pooledStaking.processPendingActions.estimateGas(iterations, {gas: maxGas});
    } catch (error) {
      if (error.message.includes('base fee exceeds gas limit')) {
        log.info(`Gas estimate exceeds MAX_GAS=${maxGas}. Halving iterations amount..`);
        iterations = Math.floor(iterations / 2);
        continue;
      } else {
        throw error;
      }
    }

    return {
      gasEstimate,
      iterations,
    };
  }
}

function getNowFormatDate() {
  let date = new Date();
  let seperator1 = "";
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  return year + seperator1 + month + seperator1 + strDate;
}


let oldMcrBNB = null;

// 每天10点提交mcr
async function mcr() {
  try {
    const minCap = await pdInst.minCap();
    const sum = await mcrInst.getAllSumAssurance();

    let mcrBNB = MINIMUM_CAPITAL_REQUIREMENT;
    let mcrdata = await mcrInst.calVtpAndMCRtp();
    log.info(`update mcr data ${mcrdata[0].toString()} from ${mcrdata[1].toString()}`);
    if (mcrdata[0].gt(mcrBNB)) {
      mcrBNB = mcrdata[0];
    }

    let threshold = await mcrInst.getThresholdValues(mcrdata[0].toString(), mcrBNB, sum.toString(), minCap.toString());
    // log.info(JSON.stringify(`${threshold.lowerThreshold}   ${threshold.upperThreshold}`));

    let lowTh = parseInt(threshold.lowerThreshold.toString()) + 1;
    // log.info(JSON.stringify(`${lowTh}`));
    let gasEstimate = await mcrInst.addMCRData.estimateGas(lowTh.toString(), mcrdata[0].toString(), mcrBNB, [toHex('BNB')], [100], getNowFormatDate(), {gas: MAX_GAS});
    const gasPrice = toBN('20000000000');

    const increasedGasEstimate = Math.floor(gasEstimate * 1.3);
    const nonce = await web3.eth.getTransactionCount(providerAddress);
    log.info(JSON.stringify({gasEstimate, increasedGasEstimate, gasPrice, nonce}));

    const tx = await mcrInst.addMCRData(lowTh.toString(), mcrdata[0].toString(), mcrBNB, [toHex('BNB')], [100], getNowFormatDate(), {
      gas: increasedGasEstimate,
      gasPrice,
      nonce,
    });

    oldMcrBNB = mcrBNB;

    log.info(`Gas used: ${tx.receipt.gasUsed}.`);

  } catch (error) {
    log.error(`Failed to handle mcr post: ${error.message}, ${error.stake}`);
  }

}

async function updateMcr() {
  log.info("try update mcr")
  let mcrBNB = MINIMUM_CAPITAL_REQUIREMENT;
  let mcrdata = await mcrInst.calVtpAndMCRtp();
  if (mcrdata[0].gt(mcrBNB)) {
    mcrBNB = mcrdata[0];
  }
  log.info(`mcr bnb ${mcrBNB}(${mcrdata[0]}) from ${mcrdata[1]}, oldMcrBNB:${oldMcrBNB}`);
  if (!oldMcrBNB) {
    oldMcrBNB = mcrBNB;
    return;
  } else if (oldMcrBNB === mcrBNB) {
    return;
  }
  if (MINIMUM_CAPITAL_REQUIREMENT.gt(mcrBNB) || oldMcrBNB.sub(mcrBNB).gt(MINIMUM_CAPITAL_UPDATE)) {
    log.info(`do update mcr old:${oldMcrBNB}, new:${mcrBNB}, min:${MINIMUM_CAPITAL_REQUIREMENT}`)
    await mcr();
  }
}


async function triggerApiCalls() {
  log.info('trigger api calls')
  const len = await pdInst.getApilCallLength();
  for (let index = 0; index < len; index++) {
    let expire = false;
    try {
      expire = await qtInst.checkCoverExpired(index);
    } catch (ignore) {
    }
    if (!expire) {
      log.info(`api:${index} not expired`)
      continue;
    }
    let callid = await pdInst.allAPIcall(index);
    log.info(`api call id: ${callid.toString()}.`);
    let apicall = await pdInst.allAPIid(callid.toString());
    log.info(`api call type: ${apicall[0].toString()}.`);

    const cov = "0x434f5600";
    const cla = "0x434c4100";
    const mcrf = "0x4d435246";
    // cov == apicall[0].toString() ||
    if (cov === apicall[0].toString() || cla === apicall[0].toString() || mcrf === apicall[0].toString()) {
      // log.info(`time : ${apicall[3].toString()}.${apicall[4].toString()}`);
      if (apicall[3].toString() === apicall[4].toString()) {
        try {
          if (cla === apicall[0].toString()) {
            const isClose = await clInst.checkVoteClosing(apicall[2].toString());
            if (isClose.toString() !== 1) {
              continue;
            }
          }

          const gasEstimate = await maInst.delegateCallBack.estimateGas(callid, {gas: MAX_GAS})

          const increasedGasEstimate = Math.floor(gasEstimate * 1.3);

          log.info(`gas: ${increasedGasEstimate}`)
          const gasPrice = '20000000000';
          const nonce = await web3.eth.getTransactionCount(providerAddress);
          const tx = await maInst.delegateCallBack(callid, {
            gas: increasedGasEstimate,
            gasPrice,
            nonce,
          });

          log.info(`Gas used: ${tx.receipt.gasUsed}.`);
        } catch (error) {
          log.error(`Failed to handle trigger gasEstimate apiid: ${callid.toString()} ${error.message}, ${error.stake}`);
        }
      }
    }
  }
}

async function init() {
  log.info('bot init');
  await nexusContractLoader.init();
  pooledStaking = nexusContractLoader.instance('PS');
  mcrInst = nexusContractLoader.instance('MC');
  pdInst = nexusContractLoader.instance('PD');
  maInst = nexusContractLoader.instance('NXMASTER');
  clInst = nexusContractLoader.instance('CL');
  qtInst = nexusContractLoader.instance('QT');
  log.info(`Using MAX_GAS_PRICE of ${MAX_GAS_PRICE}`);
  log.info(`Connecting to node at ${PROVIDER_URL}.`);
  await web3.eth.net.isListening();
  const startBalance = await web3.eth.getBalance(providerAddress);
  log.info(`Using first address ${providerAddress} for sending transactions. Current ETH balance: ${startBalance}`);
  log.info(`Loading latest master address for chain ${NETWORK} from ${versionDataURL}`);

  // mcr().catch(error => {
  //   log.error(`Unhandled app error: ${error.stack}`);
  //   process.exit(1);
  // });

  let schedule = require('node-schedule');

  schedule.scheduleJob('0 0/5 * * * *', function () {
    processPendingActions().catch(error => {
      log.error(`Unhandled app error: ${error.message}, ${error.stake}`);
      process.exit(1);
    });
  });

  schedule.scheduleJob('0 0/5 * * * *', function () {
    triggerApiCalls().catch(error => {
      log.error(`Unhandled app error: ${error.message}, ${error.stake}`);
      process.exit(1);
    });
  });

  // 每天10点定时提交MCR数据
  schedule.scheduleJob('0 0 22 * * *', function () {
    log.info("every day update mcr")
    mcr().catch(error => {
      log.error(`Unhandled app error: ${error.message}, ${error.stake}`);
      process.exit(1);
    });
  });


  // 监控池子的bnb数量，如果变小了则更新mcr防止资金损失
  schedule.scheduleJob('0/10 * * * * *', function () {
    updateMcr().catch(error => {
      log.error(`Unhandled app error: ${error.message}, ${error.stake}`);
      process.exit(1);
    });
  });
}

init().catch(error => {
  log.error(`Unhandled app error: ${error.stack}`);
  process.exit(1);
});