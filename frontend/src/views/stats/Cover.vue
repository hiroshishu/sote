<template>
  <div id="stats-cover" class="app-container">
    <el-divider content-position="left">
      <h4>Cover</h4>
    </el-divider>
    <el-row>
      <el-col class="mb20">
        <span class="title">Active Cover Amount</span>
        <highlight>
          <span v-format="'#,##0.00'">{{bnbCoverAmount}}</span> BNB /
          $<span v-format="'#,##0.00'">{{bnbCoverAmoutUSD}}</span>
        </highlight>
      </el-col>
      <el-col>
        <span class="title">Total Premiums Paid</span>
        <div class="skeleton" v-if="loading">
          <Skeleton class="skeleton-item" active :paragraph="{rows:1}" :title="false"/>
        </div>
        <highlight v-else>
          <span v-format="'#,##0.00'">{{bnbTotalPremium}}</span> BNB /
          $<span v-format="'#,##0.00'">{{bnbTotalPremiumUSD}}</span>
        </highlight>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import {mapGetters} from 'vuex'
import {watch} from "@/utils/watch";
import QuotationDataContract from "@/services/QuotationData";
import { BigNumber } from 'bignumber.js';

export default {
  components: { },
  props: ["options"],
  data() {
    return {
      QuotationData: null,
      bnbCoverAmount : "0",
      totalPremiumSOTE: "0",
      loading: true,
    }
  },
  computed: {
    ...mapGetters(['web3Status', 'member']),
    bnbCoverAmoutUSD(){
      return BigNumber(this.bnbCoverAmount).times(this.member.bnbQuote).toFixed(2, 1);
    },
    bnbTotalPremium(){
      return BigNumber(this.$etherToValue(this.totalPremiumSOTE)).times(this.options.rate).toFixed(2, 1);
    },
    bnbTotalPremiumUSD(){
      return BigNumber(this.bnbTotalPremium).times(this.member.bnbQuote).toFixed(2, 1);
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
    },
    async initContract(){
      this.QuotationData = await this.getContract(QuotationDataContract);
      this.getTotalSumAssured("BNB");
      this.getTotalPremiums();
    },
    getTotalSumAssured(token) {
      const contract = this.QuotationData.getContract();
      const charCode = [];
      for (let i = 0; i < 4; i++) {
        charCode.push(i < token.length ? token.charCodeAt(i) : 0);
      }
      contract.instance.getTotalSumAssured(charCode).then(response => {
        this[token.toLowerCase() + "CoverAmount"] = response.toString();
        this.options.totalCoverAmount = response.toString();
      }).catch((e) => {
        console.error(e);
        this.$message.error(e.message);
      });
    },
    async getTotalPremiums(){
      const instance = this.QuotationData.getContract().instance;
      let length = await instance.getCoverLength();
      length = parseInt(length.toString());
      let totalPremiumSOTE = BigNumber(0);
      for(let i=0; i<length;i++){
        const premiumSOTE = await instance.getCoverPremiumSOTE(i);
        totalPremiumSOTE = totalPremiumSOTE.plus(premiumSOTE.toString());
      }
      this.totalPremiumSOTE = totalPremiumSOTE.toString();
      this.loading = false;
    }
  }
}
</script>
<style lang="scss" scoped>
#stats-cover{
  .skeleton{
    display: inline-block;
    position: relative;
    top: 4px;
    left: 0;
    width: 120px;
  }
  .skeleton-item{
    //display: table-cell;
    vertical-align: middle;
  }
}
</style>
