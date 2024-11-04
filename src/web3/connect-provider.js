import {store} from '@/store/index'
import SETTINGS from '@/store/settings'
// import StaticConnectorVars from './static'

import {
  CosmWasmClient,
  SigningCosmWasmClient,
} from "@cosmjs/cosmwasm-stargate";

// import {
//   PrivateKey,
//   InjectiveStargate,
// } from "@injectivelabs/sdk-ts";
// import { OfflineDirectSigner } from "@cosmjs/proto-signing";
// import { assertIsBroadcastTxSuccess } from '@cosmjs/stargate'

const Self = {
  async getCoinbase (provider) {
    var accounts = await provider.send('eth_requestAccounts')
    return accounts[0]
  },
  async getKeplr () {
    if (window.keplr) {
      return window.keplr;
    }

    if (document.readyState === "complete") {
      return window.keplr;
    }

    return new Promise((resolve) => {
      const documentStateChange = (event) => {
        if (event.target && event.target.readyState === "complete") {
          resolve(window.keplr);
          document.removeEventListener("readystatechange", documentStateChange);
        }
      };

      document.addEventListener("readystatechange", documentStateChange);
    });
  },
  async connectViewOnlyProvider () {
    console.log("Connect to read client")
    const reqNet = store.state.requiredNetwork;
    
    try {
      const client = await CosmWasmClient.connect(SETTINGS.RPC_URL[reqNet])
      store.commit('updateClient', {
        client: client,
        denom: SETTINGS.CHAIN_UDENOM[reqNet]
      })
    } catch (error) {
      console.log(error)
      throw error;
    }
  },
  async connectToKeplr () {
    const reqNet = store.state.requiredNetwork;
    const CHAIN_ID = SETTINGS.CHAIN_IDS[reqNet] // "atlantic-2"
    const RPC_URL = SETTINGS.RPC_URL[reqNet] // "https://sei-testnet-2-rpc.brocha.in" // "https://rpc.testcosmos.directory/seitestnet2"
    
    console.log("CHAIN_ID: ", CHAIN_ID)
    console.log("RPC_URL", RPC_URL)

    const keplr = await this.getKeplr()

    try {
      await keplr.enable(CHAIN_ID)
      window.addEventListener("keplr_keystorechange", async () => this.connectToKeplr())  
    } catch (error) {
      console.log(error)
    }

    try {
      const offlineSigner = await keplr.getOfflineSigner(CHAIN_ID)

      // var client;
      // if (CHAIN_ID == "INJ") {
      //   client = await InjectiveStargate.InjectiveSigningStargateClient.connectWithSigner(
      //     "https://lcd-cosmoshub.keplr.app/rest",
      //     offlineSigner,
      //   )
      // } else {
      //    client = await SigningCosmWasmClient.connectWithSigner(RPC_URL, offlineSigner)
      // }
      const client = await SigningCosmWasmClient.connectWithSigner(RPC_URL, offlineSigner)

      const accounts = await offlineSigner.getAccounts()
      const address = accounts[0].address;
      
      console.log("Client:\n", client)
      console.log("Address:\n", address)
  
      store.commit('updateClient', {
        address: address,
        signedClient: client,
      })
    } catch (error) {
      console.log("Connect Keplr Wallet: ", error)
    }
  },
  // coinbase
  async connectToWalletLink () {
  },
  async connectWalletConnect () {
  },
  async connectToMobileWallet () {
  },
  removeKeplrListeners () {
  },
  addKeplrListeners () {
  },
  disconnect () {
    console.log("Disconnected")
    store.commit('updateClient', {
      address: null,
      signedClient: null
    })
    
    this.connectViewOnlyProvider()
  },
}

export default Self