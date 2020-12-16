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
        <el-tag :type="claimStatusColors[scope.row.status]" :class="{ 'el-tag-primary': claimStatusColors[scope.row.status]=='' }">
          {{claimStatus[scope.row.status]}}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column width="100"
      label="ACTION">
      <template slot-scope="scope">
        <el-link type="primary" v-if="parseInt(scope.row.status) == 0" :underline="false" @click="assess(scope.row)">Assess</el-link>
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
import { getCoverContracts } from '@/api/cover.js';


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
        "0": "Pending",
        "1": "Open to assessors",
        "2": "Open to assessors",
        "3": "Open to assessors",
        "4": "Open to assessors",
        "5": "Open to assessors",
        "10": "Accepted",
        "11": "Denied",
        "12": "Payout Pending",
      },
      claimStatusColors: {
        "0": "",
        "1": "warning",
        "2": "warning",
        "3": "warning",
        "4": "warning",
        "5": "warning",
        "10": "success",
        "11": "danger",
        "12": "",
      },
      claimStatusValue: {
        "Pending": 0,
        "OpenTo": 1,
        "Accepted": 10,
        "Denied": 11,
        "PayoutPending": 12,
      }
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
  },
  methods: {
    async initData(){
      await this.initContracts();
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    async initContract(){
      this.ClaimsData = await this.getContract(ClaimsDataContract);
      this.QuotationData = await this.getContract(QuotationDataContract);
      this.initClaimsCount();
    },
    async initContracts(){
      if(this.contracts && this.contracts.length>0){
        return;
      }
      const response = await getCoverContracts();
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

          const cover = await this.loadCover(claim.coverId);
          claim.cover = cover;
          const contlist = this.contracts.filter(item=>item.address == cover.scAddress.toString());
          claim.contract = contlist.length == 1 ? contlist[0] : null;

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
    async loadCover(cid){
      console.info("读取cover");
      const instance = this.QuotationData.getContract().instance;
      const nonStatusCover = await instance.getCoverDetailsByCoverID1(cid);
      const statusCover = await instance.getCoverDetailsByCoverID2(cid);
      const cover = {
        cid: statusCover.cid.toString(),
        sumAssured: statusCover.sumAssured.toString(),
        coverPeriod: statusCover.coverPeriod.toString(),
        validUntil: statusCover.validUntil.toString(),
        purchase: (parseInt(statusCover.validUntil.toString()) - parseInt(statusCover.coverPeriod.toString()) * 24 * 60 * 60),
        status: statusCover.status.toString(),
        premiumNXM: nonStatusCover.premiumNXM.toString(),
        currencyCode: nonStatusCover._currencyCode.toString(),
        scAddress: nonStatusCover._scAddress.toString(),
        memberAddress: nonStatusCover._memberAddress.toString(),
      }
      console.info("完成cover");
      return cover;
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
#claim-default-open{
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
