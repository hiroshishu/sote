import Web3 from 'web3'
import store from '@/store'
import WalletConnectProvider from "@walletconnect/web3-provider";
import {WEB3_STATUS, WALLET_TYPE} from '@/utils/Constants.js'
import {initMember, getAllowance, getBalance, getWBalance} from '@/api/common.js'
import Bus from '@/utils/eventBus.js'
import {BigNumber} from 'bignumber.js'

export default {
  install: function (Vue, options) {
    Vue.prototype.WEB3_STATUS = WEB3_STATUS;
    Vue.prototype.$EventNames = Bus.$EventNames;
    Vue.prototype.$Bus = Bus;
    Vue.prototype.$MaxUint256 = "115792089237316195423570985008687907853269984665640564039457584007913129639935";
    Vue.prototype.$settings = null;

    var CustomWeb3 = {
      Bus: Bus,
      web3: null,
      web3Provider: null,
      type: '', // 钱包类型
      account: null, //当前用户账户地址
      initWeb3: async function (settings) {
        Vue.prototype.$settings = settings;
        // Modern dapp browsers...
        // if (window.ethereum) {
        //   console.log(111);
        //   try {
        //     console.info("Request account access");
        //     // Request account access
        //     await window.ethereum.request({ method: 'eth_requestAccounts' })
        //   } catch (error) {
        //     // User denied account access...
        //     console.error("User denied account access")
        //     if(error.code == -32002){
        //       this.Bus.$message.error(error.message);
        //       return this;
        //     }
        //     this.Bus.$message.error("User denied account access");
        //   }
        // }
        // // Legacy dapp browsers...
        // else if (this.web3) {
        //   console.log(222);
        //   this.web3Provider = this.web3.currentProvider;
        // }
        // // If no injected web3 instance is detected, fall back to Ganache
        // else {
        //   console.log(333);
        //   this.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        // }

        if (!window.ethereum) {
          this.Bus.$message.error('No provider was found.')
          return
        }
        let currentNetwork = ''
        try {
          if (window.ethereum.isMetaMask) {
            console.log('connect metamask...');
            this.web3Provider = window.ethereum;
            console.log(this.web3Provider.networkVersion, settings.networkVersion, typeof this.web3Provider.networkVersion, typeof settings.networkVersion);
            if (!this.checkNetworkVersion()) {
              return
            }
            console.log(22);
            await window.ethereum.request({method: 'eth_requestAccounts'})
            console.log(33);
            this.web3 = new Web3(this.web3Provider);
            this.account = window.ethereum.selectedAddress;
            currentNetwork = this.web3Provider.networkVersion;
          } else {
            console.log('connect else wallet...');
            // this.web3Provider = new Web3.providers.HttpProvider(settings.rpcUrl);
            // this.web3 = new Web3(this.web3Provider);
            // this.account = window.ethereum.address;
            // currentNetwork = settings.networkVersion

            // this.web3Provider= new Web3.providers.HttpProvider(settings.rpcUrl);
            const Trust = window.Trust;
            console.log('Trust ethereum~~~~~~', window.Trust, window.ethereum);
            this.web3Provider = new Trust({
              address: "0x9d8A62f656a8d1615C1294fd71e9CFb3E4855A4F",
              chainId: settings.networkVersion,
              rpcUrl: settings.rpcUrl,
            });
            this.web3 = new Web3(this.web3Provider);
            this.account = window.ethereum.address;
            currentNetwork = await this.web3.eth.net.getId();
          }
        } catch (error) {
          this.Bus.$message.error(error.message);
        }
        // console.log('web3Provider~~~~~~~~~', this.web3Provider);
        this.type = WALLET_TYPE.INJECTED;
        store.dispatch('settings/changeSetting', {key: "currentVersion", value: currentNetwork});
        if (this.checkNetworkVersion()) {
          // 网络一致时才初始化合约相关的数据
          console.info("Network is current, initializing global events.");
          this.initEvent();
          this.initVueEvent();
          store.dispatch('app/setWeb3Status', WEB3_STATUS.AVAILABLE);
        } else {
          store.dispatch('app/setWeb3Status', WEB3_STATUS.UNAVAILABLE);
        }
        store.dispatch('member/setAccount', this.account);
        store.dispatch('app/loadingComplete');
        return this;
      },
      walletConnect: async function (settings) {
        console.log('connect walletConnect...');
        Vue.prototype.$settings = settings;
        const defaultNetwork = settings.networkVersion;
        this.web3Provider = new WalletConnectProvider({
          rpc: {
            [defaultNetwork]: settings.rpcUrl
          }
        });
        this.web3Provider.chainId = defaultNetwork
        this.web3 = new Web3(this.web3Provider);
        let accounts = []
        try {
          accounts = await this.web3Provider.enable();
        } catch (error) {
          // console.log('error:: ', error);
          this.Bus.$message.error(error.message);
        }
        this.type = WALLET_TYPE.WALLET_CONNECT;
        this.account = accounts[0];
        this.initWalletConnectEvent();
        this.initVueEvent();
        store.dispatch('app/setWeb3Status', WEB3_STATUS.AVAILABLE);
        store.dispatch('member/setAccount', this.account);
        return this;
      },
      initWalletConnectEvent() {
        this.web3Provider.on("accountsChanged", (accounts) => {
          console.log('accountsChanged~~~~~~', accounts);
          this.handleAccountChange(accounts)
        });
        this.web3Provider.on("chainChanged", (chainId) => {
          this.checkNetworkVersion(chainId)
        });
        this.web3Provider.on("disconnect", () => {
          if (this.account) {
            store.dispatch('app/disconnect', {web3: this});
          }
        });
      },
      initEvent() {
        console.log('initEvent:: ', this.web3Provider.on);
        if (!this.web3Provider.on) {
          return
        }
        this.web3Provider.on("accountsChanged", (accounts) => {
          console.log('accountsChanged~~~~~~', accounts);
          this.handleAccountChange(accounts)
        });
        this.web3Provider.on("networkChanged", () => {
          this.checkNetworkVersion()
          console.info(this.web3Provider.networkVersion);
        });
      },
      checkNetworkVersion(chainId = this.web3Provider.networkVersion) {
        console.log('Vue.prototype.$settings~~~~~', Vue.prototype.$settings)
        const supportNetworkVersion = Vue.prototype.$settings.networkVersion
        if (chainId == supportNetworkVersion) {
          return true
        }
        store.dispatch('app/disconnect', {web3: this});
        this.Bus.$message.error(`Unsupported chain id: ${this.web3Provider.networkVersion}. Supported chain ids are: ${supportNetworkVersion}.`)
      },
      initVueEvent() {
        this.Bus.$on(this.Bus.$EventNames.initMember, (vue) => {
          store.dispatch("member/setLoading", true);
          initMember(vue);
        });
        this.Bus.$on(this.Bus.$EventNames.refreshBalance, (vue) => {
          getBalance(vue);
          getWBalance(vue);
          this.web3.eth.getBalance(this.account).then((response) => {
            console.info("Account Balance: ", response.toString());
            store.dispatch("member/setAccountBalance", response.toString());
          });
        });
      },
      handleAccountChange(accounts) {
        if (accounts && accounts.length > 0) {
          this.Bus.$message.warning("Account changed");
          this.account = accounts[0];
        } else {
          this.Bus.$message("Account disconnect ");
          this.account = null;
        }
        store.dispatch("member/setAccount", this.account);
        // 触发一组事件
        this.Bus.$emitGroup(this.Bus.$EventNames.switchAccount, this.account);
      },
      async disconnectWalletConnect() {
        await this.web3Provider.disconnect()
        await this.disconnect()
      },
      disconnect: async function () {
        this.account = null;
        this.type = '';
        store.dispatch('app/setWeb3Status', WEB3_STATUS.UNAVAILABLE);
        store.dispatch('member/setAccount', '');
        store.dispatch("member/setAccountBalance", 0);
        store.dispatch("member/setBalance", 0);
        store.dispatch("member/setWBalance", 0);
        return this
      },
    };
    var getContract = async function (ContractClass) {
      const contractsMap = this.$store.getters.contracts;
      let contractObj = contractsMap[ContractClass.key];
      console.info(ContractClass.key, contractsMap);
      if (!contractObj) {
        contractObj = new ContractClass(this);
        await contractObj.initContract();
      }
      this.$store.dispatch('contract/put', contractObj);
      return contractObj;
    }

    function ether(n) {
      let utils = this.$CustomWeb3.web3.utils;
      const bn = new utils.BN(utils.toWei(n, 'ether'));
      return bn.toString();
    }

    // 默认保留小数点后两位
    function etherToNumber(n) {
      if (n != null && this.$CustomWeb3 && this.$CustomWeb3.web3) {
        let utils = this.$CustomWeb3.web3.utils;
        return BigNumber(utils.fromWei(n.toString(), 'ether').toString()).toFixed(2, 1);
      }
      return n;
    }

    // 全部返回
    function etherToValue(n) {
      if (n != null && this.$CustomWeb3 && this.$CustomWeb3.web3) {
        let utils = this.$CustomWeb3.web3.utils;
        return utils.fromWei(n.toString(), 'ether').toString();
      }
      return n;
    }

    Vue.prototype.$CustomWeb3 = CustomWeb3;
    Vue.prototype.getContract = getContract;
    Vue.prototype.$ether = ether;
    Vue.prototype.$etherToNumber = etherToNumber;
    Vue.prototype.$etherToValue = etherToValue;
  }
}
