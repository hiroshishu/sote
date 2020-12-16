import request from '@/utils/request'
import QuotationDataContract from '@/services/QuotationData';
import TokenControllerContract from '@/services/TokenController';
import PooledStakingContract from '@/services/PooledStaking';
import ClaimsRewardContract from '@/services/ClaimsReward';
import { BNB_BYTE8 } from '@/utils/Constants.js'
import { BigNumber } from 'bignumber.js'

export async function getCoverDeposit(vue){
  if(!vue.$CustomWeb3.account){
    return;
  }
  const member = vue.$store.getters.member;
  if(!member.isMember){
    return;
  }
  const QuotationData = await vue.getContract(QuotationDataContract);
  const instance = QuotationData.getContract().instance;
  const ids = await instance.getAllCoversOfUser(member.account);
  if(ids.length==0){
    return;
  }
  let count = BigNumber(0);
  for(let i=0;i<ids.length;i++){
    const coverPermium = await instance.getCoverPremiumNXM(ids[i].toString());
    count = count.plus(coverPermium.toString());
  }
  vue.$store.dispatch("member/changeMember", {
    key: "coverDeposit",
    value: count.toString()
  });
}

export async function getAssessment(vue){
  if(!vue.$CustomWeb3.account){
    return;
  }
  const member = vue.$store.getters.member;
  if(!member.isMember){
    return;
  }
  const TokenController = await vue.getContract(TokenControllerContract);
  const instance = TokenController.getContract().instance;
  const lockedStake = await instance.tokensLocked(member.account, vue.$CLA_BYTE);
  const unlockedStake = await instance.tokensUnlockable(member.account, vue.$CLA_BYTE);
  
  vue.$store.dispatch("member/changeMember", {
    key: "assessment",
    value: lockedStake.toString()
  });
  vue.$store.dispatch("member/changeMember", {
    key: "withdrawAssessment",
    value: unlockedStake.toString()
  });
}

export async function getStakeDespoid(vue){
  if(!vue.$CustomWeb3.account){
    return;
  }
  const member = vue.$store.getters.member;
  if(!member.isMember){
    return;
  }
  const PooledStaking = await vue.getContract(PooledStakingContract);
  const instance = PooledStaking.getContract().instance;
  instance.stakerDeposit(member.account).then(res => {
    vue.$store.dispatch("member/changeMember", {
      key: "stakeDeposit",
      value: res.toString()
    });
  });
  instance.stakerMaxWithdrawable(member.account).then(res => {
    vue.$store.dispatch("member/changeMember", {
      key: "withdrawStakeDeposit",
      value: res.toString()
    });
  });
}

export async function getRewards(vue){
  if(!vue.$CustomWeb3.account){
    return;
  }
  const member = vue.$store.getters.member;
  if(!member.isMember){
    return;
  }
  const PooledStaking = await vue.getContract(PooledStakingContract);
  const instance = PooledStaking.getContract().instance;
  instance.stakerReward(member.account).then(res => {
    vue.$store.dispatch("member/changeMember", {
      key: "rewards",
      value: res.toString()
    });
  });
}

export function getMemberData(vue){
  getCoverDeposit(vue);
  getAssessment(vue);
  getStakeDespoid(vue);
  getRewards(vue);
}