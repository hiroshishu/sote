<template>
  <div id="cover-overall">
    <el-card class="box-card">
      <el-form :disabled="!member.isMember">
        <el-row>
        <h2 class="main-text">Soteria Cover</h2>
        <span class="normal-text">Buy and manage your covers.</span>
        <span class="right-area">
          <el-button type="primary" plain round>How it works</el-button>
          <el-button type="primary" round @click="buyCover">Buy Cover</el-button>
        </span>
        <el-divider></el-divider>
        </el-row>
        <div class="overall">
        <el-row class="secondary-text" :gutter="20">
          <el-col :span="8">ACTIVE BNB COVER AMOUNT</el-col>
          <el-col :span="8">ACTIVE SOTE COVER AMOUNT</el-col>
          <el-col :span="8">TOTAL COVERS SOLD</el-col>
        </el-row>
        <el-row class="highlight" :gutter="20">
          <el-col :span="8">Unknown BNB</el-col>
          <el-col :span="8">Unknown SOTE</el-col>
          <el-col :span="8">Unknown</el-col>
        </el-row>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { contracts } from '@/settings.js'
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';

export default {
  name: "Overall",
  components:{
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapGetters([
      'web3',
      'member',
      'web3Status',
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
    buyCover(){
      this.$router.push("/system/cover/buy");
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#cover-overall{
  .overall {
    .el-row {
      margin-bottom: 20px !important;
    }
  }
}
</style>
