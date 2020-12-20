<template>
  <el-table
    id="claim-default-open"
    :data="claims"
    stripe
    v-loading.fullscreen.lock="loading"
    element-loading-text="Claims loading ..."
    v-el-table-infinite-scroll="load"
    height="calc(100vh - 300px)"
    style="width: 100%">
    <el-table-column
      prop="claimId" width="100"
      label="ID">
    </el-table-column>
    <el-table-column
      prop="contract"
      label="PROJECT">
      <template slot-scope="scope">
        <div v-if="scope.row.contract">
          <svg-icon :icon-class="scope.row.contract.icon" class="icon-name"></svg-icon>
          <span>{{scope.row.contract.name}}</span>
        </div>
      </template>
    </el-table-column>
    <el-table-column
      prop="cover.coverPeriod" width="200"
      label="Cover PERIOD">
      <template slot-scope="scope">
        {{formatPeriod(scope.row)}}
      </template>
    </el-table-column>
    <el-table-column
      prop="cover.sumAssured" width="240"
      label="COVER AMOUNT">
      <template slot-scope="scope">
        {{scope.row.cover.sumAssured}} BNB
      </template>
    </el-table-column>
    <el-table-column
      prop="status" width="150"
      label="STATUS">
      <template slot-scope="scope">
        <el-tag v-if="scope.row.voteId > 0" type="info">
          Already assessed
        </el-tag>
        <el-tag v-else :type="claimStatusColors[scope.row.status]" :class="{ 'el-tag-blue': claimStatusColors[scope.row.status]=='' }">
          {{claimStatus[scope.row.status]}}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column width="100"
      label="ACTION">
      <template slot-scope="scope">
        <el-link type="primary" :disabled="!member.isMember || scope.row.voteId > 0" v-if="isAssess(scope.row)" :underline="false" @click="assess(scope.row)">Assess</el-link>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import ClaimsDataContract from '@/services/ClaimsData';
import QuotationDataContract from '@/services/QuotationData';
import Moment from 'moment';
import { getCoverContracts, loadCover } from '@/api/cover.js';
import { BigNumber } from 'bignumber.js';


export default {
  name: "claims",
  components:{
  },
  data() {
    return {
      loading: false,
      dataLoading: false,
      claims: [],
      contracts: [],
      count: null,
      curId: -1,
      latestLoadTime: null,
      ClaimsData: null,
      QuotationData: null,
      claimStatus: {
        "0": "Open to assessors",
        "1": "Open to all members",
        "2": "Open to all members",
        "3": "Open to all members",
        "4": "Open to all members",
        "5": "Open to all members",
        "6": "Denied",
        "7": "Accepted",
        "8": "Accepted",
        "9": "Denied",
        "10": "Accepted",
        "11": "Denied",
        "12": "Payout Pending",
        "14": "Payout Finished",
      },
      claimStatusColors: {
        "0": "",
        "1": "warning",
        "2": "warning",
        "3": "warning",
        "4": "warning",
        "5": "warning",
        "6": "danger",
        "7": "success",
        "8": "success",
        "9": "danger",
        "10": "success",
        "11": "danger",
        "12": "info",
        "14": "info",
      },
      onload: false,
    }
  },
  computed: {
    ...mapGetters([
      'web3',
      'member',
      'web3Status',
    ])
  },
  watch: {
    web3Status: watch.web3Status,
  },
  created(){
    this.initData();
  },
  methods: {
    async initData(){
      await this.initContracts();
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    async initContract(){
      if(this.onload){
        return;
      }
      this.ClaimsData = await this.getContract(ClaimsDataContract);
      this.QuotationData = await this.getContract(QuotationDataContract);
      this.initClaimsCount();
      this.onload = true;
    },
    async initContracts(){
      if(this.contracts && this.contracts.length>0){
        return;
      }
      const response = await getCoverContracts(this);
      this.contracts = response.data;
    },
    async initClaimsCount(){
      this.claims.splice(0, this.claims.length);
      const instance = this.ClaimsData.getContract().instance;
      try{
        const count = await instance.actualClaimLength();
        this.count = parseInt(count);
        this.latestLoadTime = new Date().getTime();
        this.getClaims(this.count - 1, 5);
      }catch(e){
        console.info(e);
        this.$message.error(e.message);
      }
    },
    load(){
      if(this.dataLoading){
        // 数据加载中，直接返回
        return;
      }
      const curTime = new Date().getTime();
      if(this.latestLoadTime && curTime - this.latestLoadTime < 1000){
        // 间隔小于1秒的更新取消
        return;
      }
      this.latestLoadTime = curTime;
      this.getClaims(this.curId, 5);
    },
    async getClaims(start, size){
      try{
        // 加锁，数据加载中....
        this.dataLoading = true;
        if(start <= -1){
          return;
        }

        let curload = start;
        let loadCount = 0;

        if(start == this.count - 1){
          // 第一次加载
          this.loading = true;
          this.claims = [];
        }
        const instance = this.ClaimsData.getContract().instance;
        while(true){
          if(curload <= -1){
            this.curId = curload;
            // 所有数据加载完成了
            break;
          }
          if(loadCount >= size){
            // 本次数据加载完成了
            this.curId = curload;
            break;
          }
          // 从缓存读取数据
          const claim = this.getObjectCache(curload.toString());
          if(claim){
            // 缓存数据更新状态
            console.info("cache data......");
            const data = await instance.getClaimStatusNumber(curload.toString());
            const statno = data.statno.toString();
            claim.status = statno;
            this.getVoteId(claim);
            this.claims.push(claim);
            curload --;
            loadCount++;
            continue;
          }
          // 缓存未读到
          console.info("读取claim");
          claim = {};
          const claimData = await instance.getClaim(curload.toString());
          console.info(claimData);
          console.info("完成claim");
          claim.claimId = curload.toString();
          claim.coverId = claimData.coverId.toString();
          claim.dateUpd = claimData.dateUpd.toString();
          claim.state12Count = claimData.state12Count.toString();
          claim.status = claimData.status.toString();
          claim.vote = claimData.vote.toString();

          this.getVoteId(claim);
          const cover = await loadCover(this, claim.coverId, true, this.contracts);
          claim.cover = cover;
          claim.contract = cover.contract;

          this.claims.push(claim);
          // 缓存数据
          this.cacheObject(curload.toString(), claim);
          console.info(claim);
          curload --;
          loadCount++;
        }
      }catch(e){
        this.loading = false;
        console.error(e);
        this.$message.error(e.message);
      }finally{
        // 解锁，数据加载完成
        this.dataLoading = false;
        if(this.loading){
          this.loading = false;
          this.getClaims(this.curId, 5);
        }
      }
    },
    async getVoteId(claim){
      const instance = this.ClaimsData.getContract().instance;
      const voteId = await instance.getUserClaimVoteCA(this.member.account, claim.claimId);
      claim.voteId = voteId.toString();
    },
    formatPeriod(row){
      if(row.cover && row.cover.validUntil){
        return this.$secondsToDateString(row.cover.purchase) + " - " + this.$secondsToDateString(row.cover.validUntil);
      }
      return "-";
    },
    formatStatus(row){

    },
    assess(row){
      this.$emit("assess", row);
      //this.$router.push({ name: this.$RouteNames.COVER_CLAIM, params: JSON.parse(JSON.stringify(row)) });
    },
    isAssess(row){
      return BigNumber(row.status).eq(0);
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#claim-default-open{
  .icon-name{
    vertical-align: middle;
    margin-right: 10px;
  }
  .el-tag-blue{
    background-color: #ecf5ff;
    color: #409eff;
    border: 1px solid #d9ecff;
  }
}
</style>
