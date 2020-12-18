<template>
  <el-table
    id="cover-default-active"
    :data="activeCovers"
    stripe
    v-loading.fullscreen.lock="loading"
    element-loading-text="Cover loading ..."
    style="width: 100%">
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
      prop="cid" width="100"
      label="ID">
    </el-table-column>
    <el-table-column
      prop="sumAssured" width="240"
      label="COVER AMOUNT">
      <template slot-scope="scope">
        {{scope.row.sumAssured}} BNB
      </template>
    </el-table-column>
    <el-table-column width="240"
      label="PREMIUM">
      <template slot-scope="scope">
        {{$etherToNumber(scope.row.premiumNXM)}} SOTE
      </template>
    </el-table-column>
    <el-table-column
      prop="coverPeriod" width="200"
      label="PERIOD">
      <template slot-scope="scope">
        {{formatPeriod(scope.row)}}
      </template>
    </el-table-column>
    <el-table-column
      prop="status" width="150"
      label="STATUS">
      <template slot-scope="scope">
        <el-tag :type="coverStatusColors[scope.row.status]" :class="{ 'el-tag-blue': coverStatusColors[scope.row.status]=='' }">
          {{coverStatus[parseInt(scope.row.status)]}}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column width="100"
      label="ACTIONS">
      <template slot-scope="scope">
        <el-link type="primary" :disabled="cannotClaim(scope.row)" :underline="false" @click="claim(scope.row)">Claim</el-link>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import QuotationDataContract from '@/services/QuotationData';
import Moment from 'moment';
import { getCoverContracts } from '@/api/cover.js';

export default {
  name: "ActiveCovers",
  components:{
  },
  data() {
    return {
      loading: false,
      activeCovers: [],
      QuotationData: null,
      onload: false,
      coverStatus: [ "Active", "Claim Accepted", "Claim Denied", "Cover Expired", "Claim Submitted", "Requested" ],
      coverStatusColors: [ "", "success", "danger", "warning", "", "" ],
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
    "member.isMember": {
      handler(newVal){
        if(newVal){
          this.initData();
        }
      }
    }
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
      this.QuotationData = await this.getContract(QuotationDataContract);
      this.getActiveCovers();
    },
    async getActiveCovers(){
      try{
        if(this.onload){
          return;
        }
        if(!this.member.isMember){
          return;
        }
        this.loading = true;
        this.activeCovers.splice(0, this.activeCovers.length);
        const instance = this.QuotationData.getContract().instance;
        const ids = await instance.getAllCoversOfUser(this.member.account);
        const response = await getCoverContracts(this);
        const contracts = response.data;
        ids.forEach(async (id) => {
          try{
            const statusObj = await instance.getCoverDetailsByCoverID2(id.toString());
            const nonStatusObj = await instance.getCoverDetailsByCoverID1(id.toString());
            const contlist = contracts.filter(item=>item.address == nonStatusObj._scAddress.toString());
            this.activeCovers.push({
              cid: statusObj.cid.toString(),
              sumAssured: statusObj.sumAssured.toString(),
              coverPeriod: statusObj.coverPeriod.toString(),
              validUntil: statusObj.validUntil.toString(),
              purchase: (parseInt(statusObj.validUntil.toString()) - parseInt(statusObj.coverPeriod.toString()) * 24 * 60 * 60),
              status: statusObj.status.toString(),
              premiumNXM: nonStatusObj.premiumNXM.toString(),
              currencyCode: nonStatusObj._currencyCode.toString(),
              scAddress: nonStatusObj._scAddress.toString(),
              memberAddress: nonStatusObj._memberAddress.toString(),
              contract: contlist.length == 1 ? contlist[0] : null,
            });
          }catch(e){
            console.error(e);
          }
        });
        this.onload = true;
      }catch(e){
        this.loading = false;
        console.info(e);
        this.$message.error(e.message);
      }finally{
        this.loading = false;
      }
    },
    formatPeriod(row){
      if(row.validUntil){
        return this.$secondsToDateString(row.purchase) + " - " + this.$secondsToDateString(row.validUntil);
      }
      return "-";
    },
    formatStatus(row){

    },
    cannotClaim(row){
      return row.status==1 ||row.status==3 || row.status==4 || row.status==5;
    },
    claim(row){
      this.$router.push({ name: this.$RouteNames.COVER_CLAIM, params: JSON.parse(JSON.stringify(row)) });
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#cover-default-active{
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
