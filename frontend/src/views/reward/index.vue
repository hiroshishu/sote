<template>
  <div id="reward" class="app-container">
    <el-card class="box-card">
      <h2>Soteria Rewards</h2>
      <el-row type="flex" justify="space-between" align="middle">
        <el-col :span="6">You have {{member.rewards}} SOTE available</el-col>
        <el-col :span="4"><el-button type="primary" disabled class="withdraw-btn">Withdraw all</el-button></el-col>
      </el-row>
    </el-card>
    <channel />
  </div>
</template>

<script>
import Channel from "@/views/reward/Channel";
import {mapGetters} from 'vuex'

export default {
  components: { Channel },
  computed: {
    ...mapGetters([
      'member'
    ])
  },
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
