<template>
  <div id="stake-staked-overall">
    <el-card class="box-card">
      <el-form :disabled="!member.isMember">
        <el-row>
          <h2 class="main-text">Soteria Staking</h2>
          <span class="normal-text">Earn rewards by staking SOTE on projects you think are secure.</span>
          <span class="right-area">
            <el-button type="primary" plain round @click="stats">Stats</el-button>
            <el-button type="primary" round @click="staking">Start staking</el-button>
          </span>
          <el-divider></el-divider>
        </el-row>
        <div class="overall">
          <el-row class="secondary-text" :gutter="20">
            <el-col :span="6">CURRENT STAKED</el-col>
            <el-col :span="6">DEPOSIT USAGE</el-col>
            <el-col :span="6">TOTAL REWARDS</el-col>
            <el-col :span="6">ANNUALIZED RETURNS</el-col>
          </el-row>
          <el-row class="highlight" :gutter="20">
            <el-col :span="6">{{staked}} SOTE</el-col>
            <el-col :span="6">{{depositUsage}}%</el-col>
            <el-col :span="6">Unknown</el-col>
            <el-col :span="6">Unknown</el-col>
          </el-row>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import { BigNumber } from 'bignumber.js'

export default {
  name: "Overall",
  components:{
  },
  props: ["options"],
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters([
      'web3',
      'member',
      'web3Status',
      'settings'
    ]),
    staked(){
      return this.options.stakedProjects.map(item => item.ownerStaked).reduce((total, item) => BigNumber(total?total:0).plus(item?item:0)).toString();
    },
    depositUsage(){
      const totalDeposit = BigNumber(this.options.deposit).multipliedBy(this.settings.stake.maxAmount.toString());
      return BigNumber(this.staked).multipliedBy(100).div(totalDeposit).toFixed(2).toString();
    },
  },
  watch: {
    web3Status: watch.web3Status,
  },
  created(){
    this.initData();
    this.$Bus.bindEvent(this.$EventNames.switchAccount, this._uid, (account)=>{
      this.initData();
    });
  },
  methods: {
    initData(){
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    async initContract(){

    },
    staking(){
      this.$router.push({name: "StakeStake", params: JSON.parse(JSON.stringify(this.options))});
    },
    stats(){
      this.$router.push("/system/stake/stats");
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#stake-staked-overall{
  .overall {
    .el-row {
      margin-bottom: 20px !important;
    }
  }
}
</style>
