<template>
  <div>
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
            {{scope.row.ownerStaked}} SOTE
          </template>
        </el-table-column>
        <el-table-column
          prop="unstaking"
          label="UNSTAKE">
          <template slot-scope="scope">
            <el-form :model="scope.row">
              <el-form-item :rules="rule(scope.row)" prop="unstaking">
                <el-input-number size="mini" v-model="scope.row.unstaking" class="right-input">
                </el-input-number>SOTE
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
    rule(row){
      return [{ trigger: 'blur', validator: this.validatePerAmount, row: row }];
    },
    validatePerAmount(rule, value, callback){
      // 每个合约最少unstake 20
      if(BigNumber(value).gt(0) && !BigNumber(value).eq(rule.row.ownerStaked)){
        callback(new Error(`You can only unstake ${rule.row.ownerStaked} SOTE of this contract.`));
        return;
      }
    },
  }
}
</script>

<style lang="scss">
    .right-input {
        .el-input__inner {
            text-align: right !important;
        }
    }
</style>
