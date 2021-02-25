<template>
  <div id="stats-token" class="app-container">
    <el-divider content-position="left">
      <h4>Token</h4>
    </el-divider>
    <el-row>
      <el-col :xs="24" :sm="12" class="mb20">
        <span class="title">SOTE Price</span>
        <highlight>1 SOTE = {{options.rate}} BNB</highlight>
      </el-col>
      <el-col :xs="24" :sm="12" class="mb20">
        <span class="title">SOTE Supply</span>
        <highlight>
          <span v-format="'#,##0.00'">{{$etherToNumber(totalSupply)}}</span> SOTE
        </highlight>
      </el-col>
      <el-col :xs="24" :sm="12" class="mb20">
        <span class="title">SOTE Market Cap</span>
        <highlight>$<span v-format="'#,##0.00'">{{totalSupplyUSD}}</span></highlight>
      </el-col>
      <el-col :xs="24" :sm="12">
        <span class="title">Count of Members</span>
        <div class="skeleton" v-if="loadingCountOfMembers">
          <Skeleton class="skeleton-item" active :paragraph="{rows:1}" :title="false"/>
        </div>
        <highlight v-else>{{countOfMembers}}</highlight>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import {mapGetters} from 'vuex'
import {watch} from "@/utils/watch";
import SOTETokenContract from '@/services/SOTEToken';
import { BigNumber } from 'bignumber.js';
import {countOfMembers} from "@/api/stat";

export default {
  components: { },
  props: ["options"],
  data() {
    return {
      SOTEToken: null,
      totalSupply: 0,
      loadingCountOfMembers: true,
      countOfMembers: 0,
    }
  },
  computed: {
    ...mapGetters(['web3Status', 'member', 'settings']),
    bnbTotalSupply(){
      return BigNumber(this.$etherToValue(this.totalSupply)).times(this.options.rate).toFixed(2, 1);
    },
    totalSupplyUSD(){
      return BigNumber(this.bnbTotalSupply).times(this.member.bnbQuote).toFixed(2, 1);
    }
  },
  watch: {
    web3Status: watch.web3Status
  },
  created() {
    this.initData();
    this.$Bus.bindEvent(this.$EventNames.switchAccount, this._uid, ()=>{
      this.initData();
    });
  },
  methods: {
    initData() {
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
      this.getCountOfMembers();
    },
    async initContract(){
      if(!this.SOTEToken) this.SOTEToken = await this.getContract(SOTETokenContract);
      this.getTokenSupply();
    },
    getTokenSupply(){
      const instance = this.SOTEToken.getContract().instance;
      instance.totalSupply().then(res => {
        this.totalSupply = res.toString();
      });
    },
    async getCountOfMembers(){
      countOfMembers().then(res => {
        this.countOfMembers = res.data;
        this.loadingCountOfMembers = false;
      }).catch(e => {
        this.$message.error(e.message);
        this.countOfMembers = 0;
        this.loadingCountOfMembers = false;
      });
    },
    open(){
      window.open(this.settings.uniqueAddresses);
    }
  }
}
</script>
<style lang="scss" scoped>
#stats-token{
  .address{

  }
}
</style>
