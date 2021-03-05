import Cookies from 'js-cookie'
import { WEB3_STATUS, WALLET_TYPE } from '@/utils/Constants.js'
import store from "@/store";

const state = {
  sidebar: {
    opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
    withoutAnimation: false
  },
  device: 'desktop',
  web3: null,
  web3Status: WEB3_STATUS.UNAVAILABLE,
  loading: false, //应用初始化中，请等待
}

const mutations = {
  TOGGLE_SIDEBAR: state => {
    state.sidebar.opened = !state.sidebar.opened
    state.sidebar.withoutAnimation = false
    if (state.sidebar.opened) {
      Cookies.set('sidebarStatus', 1)
    } else {
      Cookies.set('sidebarStatus', 0)
    }
  },
  CLOSE_SIDEBAR: (state, withoutAnimation) => {
    Cookies.set('sidebarStatus', 0)
    state.sidebar.opened = false
    state.sidebar.withoutAnimation = withoutAnimation
  },
  TOGGLE_DEVICE: (state, device) => {
    state.device = device
  },
  SET_WEB3: (state, web3) => {
    state.web3 = web3
    if (web3.account) {
      localStorage.setItem('connectorId', web3.type)
    }
  },
  SET_WEB3_STATUS: (state, status) => {
    state.web3Status = status
  },
  LOADING_COMPLETE: (state) => {
    state.loading = false
  },

}

const actions = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  closeSideBar({ commit }, { withoutAnimation }) {
    commit('CLOSE_SIDEBAR', withoutAnimation)
  },
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device)
  },
  async setWeb3({ commit }, {web3, settings, type}) {
    if (type === WALLET_TYPE.WALLET_CONNECT) {
      await web3.walletConnect(settings)
    } else {
      await web3.initWeb3(settings)
    }
    console.info("Init web3 finished", web3.account);
    commit('SET_WEB3', web3);
  },
  setWeb3Status({ commit }, status) {
    commit('SET_WEB3_STATUS', status);
  },
  async disconnect({ commit }, {web3}) {
    const type = web3.type
    if (type === WALLET_TYPE.WALLET_CONNECT) {
      await web3.disconnectWalletConnect()
    } else {
      await web3.disconnect()
    }
    console.info("web3 disconnect");
    localStorage.removeItem('connectorId')
  },
  loadingComplete({ commit }) {
    commit('LOADING_COMPLETE');
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
