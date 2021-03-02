<template>
  <div class="wallet-dialog">
    <el-dialog
      title="Connect to a wallet"
      :visible.sync="dialogVisible"
      width="30%">
      <div>
        <span>Metamask</span>
        <i></i>
      </div>
      <div>
        <span>WalletConnect</span>
        <i></i>
      </div>
      <span slot="footer" class="dialog-footer"></span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "walletSelect",
  data() {
    return {
      dialogVisible: false
    }
  },
  props: ['showDialog'],
  watch: {
    showDialog() {

    }
  }
}
</script>

<style scoped>

</style>
