<template>
  <div id="cover-claim-details">
  </div>
</template>

<script>
import { watch } from '@/utils/watch.js';
import { mapGetters } from 'vuex';
import { BigNumber } from 'bignumber.js';

export default {
  components:{
  },
  props: ["options"],
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
  },
  destroyed(){
  },
  methods: {
    initData(){
      if(this.web3Status === this.WEB3_STATUS.AVAILABLE){
        this.initContract();
      }
    },
    async initContract(){

    },
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/element-variables.scss';
#cover-claim-details{
}
</style>
