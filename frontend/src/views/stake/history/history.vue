<template>
  <el-card id="stake-history-history" class="box-card">
    <h3 class="main-text">Unstake history</h3>
    <div class="secondary-text">
      <el-table
        :data="historyList"
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
          prop="unstaked"
          label="AMOUNT">
          <template slot-scope="scope">
            {{scope.row.unstaked}} SOTE
          </template>
        </el-table-column>
        <el-table-column
          prop="stake"
          label="REQUEST">
          <template slot-scope="scope">
            Unknown
          </template>
        </el-table-column>
        <el-table-column
          label="DUE">
          <template slot-scope="scope">
            Unknown
          </template>
        </el-table-column>
      </el-table>
    </div>
  </el-card>
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
    historyList(){
      return this.options.stakedProjects.filter(item => BigNumber(item.unstaked).gt(0) || (item.stakedStatus == 'staked' && BigNumber(item.ownerStaked).eq(0)));
    }
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
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#stake-history-history{
  .icon-name {
    vertical-align: middle;
    margin-right: 15px;
  }
  .secondary-text{
    line-height: 35px;
  }
}
</style>
