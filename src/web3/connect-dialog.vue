<template>
  <v-dialog v-model="dialog" persistent max-width="450" content-class="br-20">
    <v-card class="br-20">
      <div>
        <v-row class="pa-4 ma-0 font-weight-medium background align-center">
          <div>
            Connect your wallet
          </div>
          &nbsp;
          <v-progress-circular v-if="loadConnect"
            indeterminate
            size="20"
            width="2"
            color="text"
          >
          </v-progress-circular>

          <v-spacer></v-spacer>
          
          <v-btn @click="close" icon color="text">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-row>

        <v-expand-transition mode="out-in">
          <v-card v-if="sClient.address" outlined class="background blocks br-0 d-flex align-center pa-3">
            <img 
            src="@/assets/img/APEX.png"
            width="40px"
            >
            <div class="ml-3" style="flex: 1;">
              <div class="caption d-flex align-center white--text font-weight-medium">
                <copy-address :address="sClient.address" color="white"></copy-address>
                <v-spacer></v-spacer>
                Connected
              </div>
              <div class="d-flex align-center white--text">
                {{ coinBalanceHuman }} {{ $store.state.nativeGasTokenSymbol }}
                <v-spacer></v-spacer>
                <v-btn color="white" depressed class="blue--text" small rounded @click="disconnect" >
                  Disconnect
                  <v-icon small class="ml-1">mdi-exit-to-app</v-icon>
                </v-btn>
              </div>
            </div>
          </v-card>
        </v-expand-transition>

        <div 
        @click="connectToKeplr()"
        class="c-list border-b pa-4 d-flex align-center">
          <img 
          src="https://assets-global.website-files.com/634cded3a83bb67e764ed8e5/64eb418a3feded5cf740ccc3_keplr-icon.svg" 
          width="30px"
          class="mr-3">
          <div class="font-weight-bold d-flex align-center">
            Keplr
            <!-- <v-icon small color="text" class="ml-1">mdi-star-outline</v-icon> -->
          </div>
        </div>

      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import ConnectProvider from './connect-provider'
import SETTINGS from '@/store/settings'
import Utils from '@/web3/utils'

export default {
  components: {
  },
  data: () => ({
    tab: 0,
    dialog: false,
    resolve: null,
    reject: null,
    nativeCoinBalance: '0',
    loadConnect: false
  }),
  computed: {
    sClient () {
      return this.$store.state.signer
    },
    sClientWatcher () {
      return this.sClient.watcher
    },
    wrongNetwork () {
      return this.$store.state.wrongNetwork
    },
    requiredNetwork () {
      return this.$store.state.requiredNetwork
    },
    addressCondensed () {
      var address = this.sClient.address
      if (!address) {
        return ''
      }
      return address.slice(0, 6) + '...' + address.slice(address.length - 4)
    },
    coinBalanceHuman () {
      var amount = Utils.convertMicroDenomToDenom(this.nativeCoinBalance.amount, SETTINGS.CHAIN_DECIMALS[this.requiredNetwork])
      return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})
    }
  },

  watch: {
    sClientWatcher () {
      this.getNativeCoinBalance()
    },
  },

  methods: {
    async getNativeCoinBalance () {
      if (!this.sClient.address) {
        return
      }

      console.log("[R_CLIENT]", this.sClient.client)
      console.log("[ADDRESS]", this.sClient.address)
      console.log("[DENOM]", this.sClient.denom)
      var coinBalance = await this.sClient.client.getBalance(this.sClient.address, this.sClient.denom)
      this.nativeCoinBalance = coinBalance
    },
    open () {
      this.tab = this.$vuetify.breakpoint.xs ? 1 : 0
      this.dialog = true
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },
    close () {
      this.dialog = false
      this.reject()
    },
    closeAndResolve () {
      this.dialog = false
      this.resolve()
    },
    requireConnectionThen (callback) {
      if (!this.sClient.address) {
        this.open()
          .then(() => {
            callback()
          })
          .catch(e => {})
      } else {
        callback()
      }
    },
    async connectToKeplr () {
      this.loadConnect = true
      await ConnectProvider.connectToKeplr()
      this.closeAndResolve()
      this.loadConnect = false
    },
    disconnect () {
      ConnectProvider.disconnect()
    },
  }
}
</script>