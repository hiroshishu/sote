<template>
  <div id="stake-unstake-projects">
    <el-card class="box-card">
      <el-table
        :data="options.stakedProjects"
        stripe
        style="width: 100%">
        <el-table-column
          prop="name"
          label="PROJECT">
          <template slot-scope="scope">
            <svg-icon :icon-class="scope.row.icon" class="icon-name"></svg-icon>
            {{scope.row.name}}
          </template>
        </el-table-column>
        <el-table-column
          prop="ownerStaked"
          label="AVAILABLE AMOUNT">
          <template slot-scope="scope">
            {{formatStaked(scope.row)}} SOTE
          </template>
        </el-table-column>
        <el-table-column
          prop="unstaking"
          label="UNSTAKE">
          <template slot-scope="scope">
            <el-form :model="scope.row">
              <el-form-item prop="unstaking">
                <el-switch @change="unstakeChange(scope.row)" :disabled="isNotUnstake(scope.row)"
                  v-model="scope.row.unstakeFlag" >
                </el-switch>
                {{scope.row.unstaking}} SOTE
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
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
      
    }
  },
  computed: {
    ...mapGetters([
      'web3',
      'member',
      'web3Status',
      'settings'
    ]),
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
    formatStaked(row){
      if(row.oldOwnerStaked == undefined){
        row.oldOwnerStaked = row.ownerStaked;
      }
      return row.oldOwnerStaked;
    },
    isNotUnstake(row){
      return BigNumber(row.ownerStaked).eq(0) || BigNumber(row.unstaked).gt(0);
    },
    unstakeChange(row){
      if(row.unstakeFlag){
        row.unstaking = row.ownerStaked;
        row.oldOwnerStaked = "0";
      }else{
        row.oldOwnerStaked = row.ownerStaked;
        row.unstaking = "0";
      }
    },
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#stake-unstake-projects{
  .el-form-item{
    margin-bottom: 0px;
  }
}
</style>
<style lang="scss">
    .right-input {
        .el-input__inner {
            text-align: right !important;
        }
    }
</style>
