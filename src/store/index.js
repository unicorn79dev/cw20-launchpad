import Vue from 'vue'
import Vuex from 'vuex'
import themes from '@/plugins/themes.js'
import ConnectProvider from '@/web3/connect-provider'
import SETTINGS from '@/store/settings'

Vue.use(Vuex)

// SETTINGS - CHANGE ALL
const NETWORK = 'SEI'

export const store = new Vuex.Store({
  state: {
    theme: 'theme1',
    requiredNetwork: NETWORK,
    requiredNetworkDisplayName: SETTINGS.CHAIN_DISPLAY_NAME[NETWORK],
    etherscan_url: SETTINGS.ETHERSCAN_URL[NETWORK],
    explorer_name: SETTINGS.EXPLORER_NAME[NETWORK],
    nativeGasTokenSymbol: SETTINGS.NATIVE_GAS_TOKEN_SYMBOL[NETWORK],
    wrongNetwork: false,
    
    signer: {
      address: null,
      address_condensed: null,
      signedClient: null,
      client: null,
      denom: null,
      watcher: null,
    },
    ethers: {
      coinbase: null,
      coinbase_condensed: null,
      providerName: null, // values: Metamask, Coinbase
      provider: null,
      signer: null,
      network: 1,
      watcher: null, // watcher
      walletConnectProvider: null,
      walletLinkProvider: null,
    },
    pendingTx: {
      pending: [], // [txhash, txhash]
      tx: {}
    },
  },
  mutations: {
    setWrongNetwork (state, flag) {
      state.wrongNetwork = flag
    },
    switchChain (state, network) {
      console.log('switch to', network)
      state.requiredNetwork = network
      state.requiredNetworkDisplayName = SETTINGS.CHAIN_DISPLAY_NAME[network]
      state.etherscan_url = SETTINGS.ETHERSCAN_URL[network]
      state.explorer_name = SETTINGS.EXPLORER_NAME[network]
      state.nativeGasTokenSymbol = SETTINGS.NATIVE_GAS_TOKEN_SYMBOL[network]

      ConnectProvider.disconnect()
      ConnectProvider.connectViewOnlyProvider()
    },
    setTheme (state, {themeName, vuetify}) {
      state.theme = themeName
      vuetify.theme.setTheme('light', themes[themeName].light)
      localStorage.setItem('theme', themeName)
    },
    updateEthers (state, payload) {
      state.ethers = Object.assign(state.ethers, payload)
      // state.ethers.watcher = state.ethers.coinbase + state.ethers.network
      state.ethers.watcher = state.ethers.coinbase + state.requiredNetwork
      if ((state.ethers.coinbase || '').length === 42) {
        state.ethers.coinbase_condensed = state.ethers.coinbase.slice(0, 6) + '...' + state.ethers.coinbase.slice(state.ethers.coinbase.length - 4)
      }
    },
    updateClient (state, payload) {
      state.signer = Object.assign(state.signer, payload)
      state.signer.watcher = state.signer.address + state.requiredNetwork
      if ((state.signer.address || '').length === 42) {
        state.signer.address_condensed = state.signer.address.slice(0, 6) + '...' + state.signer.address.slice(state.signer.address.length - 4)
      }
    },
    addPendingTx (state, txhash) {
      state.pendingTx.pending.push(txhash)

      var item = {
        created: Date.now(),
        txhash: txhash,
        network: state.requiredNetwork,
        state: 'pending'
      }
      Vue.set(state.pendingTx.tx, txhash, item)
    },
    completePendingTx (state, txhash) {
      state.pendingTx.pending = state.pendingTx.pending.filter(item => item !== txhash)
      state.pendingTx.tx[txhash].state = 'completed'
    },
    failPendingTx (state, txhash) {
      state.pendingTx.pending = state.pendingTx.pending.filter(item => item !== txhash)
      if (state.pendingTx.tx[txhash]) {
        state.pendingTx.tx[txhash].state = 'failed'
      }
    },
  },
  actions: {
  },
  modules: {
  },
  getters: {
  }
})
