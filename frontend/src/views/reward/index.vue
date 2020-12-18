<template>
  <div id="reward" class="app-container">
    <el-card class="box-card">
      <h2>Soteria Rewards</h2>
      <el-row type="flex" justify="space-between" align="middle">
        <el-col :span="6">You have 0 SOTE available</el-col>
        <el-col :span="4"><el-button type="primary" disabled class="withdraw-btn" @click="withdraw">Withdraw all</el-button></el-col>
      </el-row>
    </el-card>
    <channel />
  </div>
</template>

<script>
import Channel from "@/views/reward/Channel";
import {mapGetters} from "vuex";

export default {
  components: { Channel },
  filters: {},
  computed: {
    ...mapGetters([
      'web3',
      'web3Status',
      'settings'
    ]),
  },
  created() {
    this.initData();
    this.$Bus.bindEvent(this.$EventNames.switchAccount, this._uid, (account)=>{
      this.initData();
    });
  },
  methods: {
    async initData(){
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        // this.initContract();
      }
    },
    async initContract(){
      // this.ClaimsReward = await this.getContract(ClaimsRewardContract);
      // console.info("ClaimsReward:", this.ClaimsReward);
      // this.$Bus.$emit(this.$EventNames.refreshAllowance, this.settings.contracts.TokenController, "TokenController");
    },
    withdraw() {
      this.loading = true;
      const contract = this.ClaimsReward.getContract();
      contract.instance.withdrawMembership({ from: this.$CustomWeb3.account }).then(response => {
        console.info(response, response.toString());
        this.$message.success("Withdraw membership success!");
        this.$Bus.$emit(this.$EventNames.initMember, this);
        this.loading = false;
      }).catch((e) => {
        console.error(e);
        this.$message.error(e.message);
        this.loading = false;
      });
    }
  }
}
</script>
<style lang="scss" scoped>
  #reward {
    .box-card {
      margin-bottom: 20px;
    }
    .withdraw-btn {
      width: 100%;
    }
  }
</style>
