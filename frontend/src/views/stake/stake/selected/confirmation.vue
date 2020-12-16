<template>
    <div id="stake-stake-selected-confirm" class="secondary-text">
      <el-form label-width="150px">
        <el-form-item label="Stake Increment:">
            {{incrementAmount}} SOTE
        </el-form-item>
        <el-form-item label="Total Stake:">
            {{usedAmount}} SOTE
        </el-form-item>
        <el-form-item label="Deposit Increment:">
            {{options.perAmount}} SOTE
        </el-form-item>
        <el-form-item label="Total Deposit:">
            {{totalDeposit}} SOTE
        </el-form-item>
        <el-form-item label="Contracts:">
            {{options.selectedProject.length}}
        </el-form-item>
      </el-form>
      <el-row v-if="isInsufficientAllowance" class="error">
        <svg-icon icon-class="circle" class="icon-name"></svg-icon>
        Insufficient Allowance
      </el-row>
    </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import { BigNumber } from 'bignumber.js'

export default {
  components:{
  },
  props: ["options"],
  data() {
    return {
      allowance: "0",
    }
  },
  computed: {
    ...mapGetters([
      'web3',
      'member',
      'web3Status',
      'settings'
    ]),
    // 已经stake的总和
    usedAmount(){
      // 计算总和
      if(this.options.selectedProject.length==0){
        return 0;
      }
      return this.options.selectedProject.map(item=>BigNumber(item.stake).plus(item.ownerStaked))
                            .reduce((total, item)=>BigNumber(total?total:0).plus(item?item:0));
    },
    // 本次增加的stake
    incrementAmount(){
      // 计算总和
      if(this.options.selectedProject.length==0){
        return 0;
      }
      return this.options.selectedProject.map(item=>BigNumber(item.stake))
                            .reduce((total, item)=>BigNumber(total?total:0).plus(item?item:0));
    },
    totalDeposit(){
      return BigNumber(this.options.totalAmount.toString()).plus(this.options.perAmount).toString();
    },
    isInsufficientAllowance(){
      return false;
      // return BigNumber(this.$ether(this.usedAmount.toString()).toString()).comparedTo(BigNumber(this.allowance.toString())) > 0;
    }
  },
  watch: {
    web3Status: watch.web3Status,
  },
  created(){
    this.$Bus.$on(this.$EventNames.allowance, (allowance)=>{
      if(!allowance){
        this.allowance = "0";
      }
      if(allowance && allowance.contractName == "PooledStaking"){
        this.allowance = allowance.curAllowance ? allowance.curAllowance : "0";
      }
    });
    this.initData();
    this.$Bus.bindEvent(this.$EventNames.switchAccount, this._uid, (account)=>{
      this.initData();
    });
  },
  methods: {
    initData(){
      // this.$Bus.$emit(this.$EventNames.setNeedAllowance, "PooledStaking", this.usedAmount, true);
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    async initContract(){
      // this.$Bus.$emit(this.$EventNames.refreshAllowance, this.settings.contracts.PooledStaking, "PooledStaking");
    },
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#stake-stake-selected-confirm{
  .el-form-item{
    margin-bottom: 0px;
  }
  .icon-name {
    vertical-align: middle;
    margin-right: 15px;
  }
}
</style>
