<template>
  <div id="member-withdraw">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span class="page-title">Withdraw membership</span>
          </div>
          <div class="normal-text">
            Membership can be withdrawn only if the following conditions are met:
            <div>
              <svg-icon icon-class="circle" class="icon-name green"></svg-icon>
              No <highlight> active covers </highlight>or
              <highlight>tokens staked</highlight>
              on claim assessment or pooled staking.
            </div>
            <div>
              <svg-icon icon-class="circle" class="icon-name green"></svg-icon>
              No <highlight>tokens locked</highlight>
              in <highlight>governance voting</highlight>.
            </div>
            <div>
              <svg-icon icon-class="circle" class="icon-name green"></svg-icon>
              No <highlight>rewards</highlight> pending to be claimed.
            </div>
            <div class="important">
              <svg-icon icon-class="circle" class="icon-name"></svg-icon>
              Your <highlight>SOTE token balance</highlight> should be 0.
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span class="page-title">Switch to new address</span>
          </div>
          <div class="normal-text">
            Membership can be switched only if the following conditions are met:
            <div class="important">
              <svg-icon icon-class="circle" class="icon-name"></svg-icon>
              No <highlight> active covers </highlight>or
              <highlight>tokens staked</highlight>
              on claim assessment or pooled staking.
            </div>
            <div>
              <svg-icon icon-class="circle" class="icon-name green"></svg-icon>
              No <highlight>tokens locked</highlight>
              in <highlight>governance voting</highlight>.
            </div>
            <div>
              <svg-icon icon-class="circle" class="icon-name green"></svg-icon>
              No <highlight>rewards</highlight> pending to be claimed.
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
</script>

<style lang="scss" scoped>
.important {
  color: #F56C6C;
}

#member-withdraw{
  .box-card{
    height: 300px;
  }
  .normal-text{
    line-height: 35px;
  }
  .icon-name{
    margin-right: 15px;
  }
  .green{
    color: #67C23A;
  }
}
</style>
