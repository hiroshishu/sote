<template>
  <el-table
    id="claim-default-assess"
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
      prop="cover.sumAssured" width="240"
      label="COVER AMOUNT">
      <template slot-scope="scope">
        {{scope.row.cover.sumAssured}} BNB
      </template>
    </el-table-column>
    <el-table-column
      prop="assessed" width="200"
      label="ASSESSED AS">
      <template slot-scope="scope">
        Claims assessor
      </template>
    </el-table-column>
    <el-table-column
      prop="vote.verdict" width="150"
      label="YOUR VERDICT">
      <template slot-scope="scope">
        <el-tag :type="verdictsColors[scope.row.vote.verdict]">
          {{verdicts[scope.row.vote.verdict]}}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column
      prop="finalVerdict" width="150"
      label="FINAL VERDICT">
      <template slot-scope="scope">
        <el-tag :type="verdictsColors[scope.row.finalVerdict]">
          {{verdicts[scope.row.finalVerdict]}}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import ClaimsContract from '@/services/Claims';
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
      claimIds: [],
      claims: [],
      contracts: [],
      curId: -1,
      count: 0,
      latestLoadTime: null,
      Claims: null,
      ClaimsData: null,
      QuotationData: null,
      verdicts: {
        "-1": "Denied",
        "0": "Pending",
        "1": "Accepted",
      },
      verdictsColors: {
        "-1": "dange",
        "0": "info",
        "1": "success",
      },
      key: "assess_",
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
    async initData(){
      await this.initContracts();
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    async initContract(){
      this.Claims = await this.getContract(ClaimsContract);
      this.ClaimsData = await this.getContract(ClaimsDataContract);
      this.QuotationData = await this.getContract(QuotationDataContract);
      this.initClaimsCount();
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
        const count = await instance.getVoteAddressCALength(this.member.account);
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
        if(this.dataLoading){
          // 数据加载中，直接返回
          return;
        }
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
          const voteIndex = await instance.getVoteAddressCA(this.member.account, curload.toString());
          const vote = await this.loadVote(voteIndex);
          const finalVerdict = await instance.getFinalVerdict(vote.claimId);

          // 从缓存读取数据
          let claim = this.getObjectCache(this.key + vote.claimId);

          if(claim){
            // 缓存数据更新状态
            console.info("cache data......");
          }else{
            // 缓存未读到
            console.info("读取claim");
            claim = {};
            await this.loadClaim(vote.claimId, claim);
            console.info("完成claim");

            // 查cover
            const cover = await loadCover(this, claim.coverId, false, this.contracts);
            claim.cover = cover;
            claim.contract = cover.contract;
          }
          claim.vote = vote;
          claim.finalVerdict = finalVerdict.toString();

          this.claims.push(claim);
          // 缓存数据
          this.cacheObject(this.key + vote.claimId, claim);
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
    async loadVote(voteIndex){
      const instance = this.ClaimsData.getContract().instance;
      const vote = await instance.getVoteDetails(voteIndex.toString());
      return {
        claimId: vote.claimId.toString(),
        tokens: vote.tokens.toString(),
        verdict: vote.verdict.toString(),
        rewardClaimed: vote.rewardClaimed.toString()
      };
    },
    async loadClaim(claimId, claim){
      const instance = this.Claims.getContract().instance;
      const claimData = await instance.getClaimbyIndex(claimId.toString());
      claim.claimId = claimData.claimId.toString();
      claim.status = claimData.status.toString();
      claim.finalVerdict = claimData.finalVerdict.toString();
      claim.claimOwner = claimData.claimOwner.toString();
      claim.coverId = claimData.coverId.toString();
      return claim;
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
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#claim-default-assess{
  .icon-name{
    vertical-align: middle;
    margin-right: 10px;
  }
  .el-tag-primary{
    background-color: #ecf5ff;
    color: #409eff;
    border: 1px solid #d9ecff;
  }
}
</style>
