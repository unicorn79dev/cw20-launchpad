<template>

  <div>

    <v-icon size="180" style="color: var(--v-background-base)!important; position: absolute; right: -30px; top: -30px;">mdi-arrow-up-circle-outline</v-icon>

    <div style="position: relative;">

      <div class="display-1 textFaint--text font-weight-bold mb-8">
        Edit / Withdraw
      </div>

      <div v-if="!sClient.address" class="mt-6 text-center">
        <v-btn
        @click="connectWallet"
        outlined
        :class="['font-weight-bold mb-4', {'purple-button white--text': !sClient.address}]"
        rounded depressed
        >
            <span v-if="!sClient.address">Connect Wallet</span>
            <span v-else>Account: {{ sClient.address_condensed }}</span>
        </v-btn>
      </div>

      <template v-else>

        <div class="mt-8">
          Enter the pair address you would like to access
        </div>

        <div class="mt-2 d-flex align-center pa-3 r-outlined br-20 inputcolor">
          <c-input :value.sync="searchPair" :placeholder="`pair address...`" class="heading--text">
          </c-input>
        </div>

        <div class="caption textFaint--text">
          e.g. inj70bb2736e218861dca818d1e9f7a1930fe61e5b
        </div>

        <div v-if="loadingPair" class="mt-4 mb-4 text-center">
          <v-progress-circular
          indeterminate
          size="60"
          color="primary">
          </v-progress-circular>
          <div>
            Finding pair
          </div>
        </div>

        <div v-if="lpAddress">

          <div class="mt-8 pt-2 pb-2 t-large">
            Pair found
          </div>

          <!-- <div class="d-flex align-center">
            <coin-icon :address="'addr0'"></coin-icon>
            <coin-icon :address="'addr1'" class="mr-2"></coin-icon>
            {{ 'sym0' }} / {{ 'sym1' }}

            <v-spacer></v-spacer>

            {{ uniBalanceHuman }}
          </div> -->

          <v-btn @click="$emit('on-continue', lpAddress)" depressed rounded color="primary" block x-large class="mt-6">
            Continue
          </v-btn>

        </div>

        <user-locked-pairs @on-select="onSelectLockedPair" :key="sClient.address" class="mt-8"></user-locked-pairs>

      </template>
    </div>

  </div>
</template>

<script>
import UserLockedPairs from '@/views/lockerv1/account/locked-pairs'
import Utils from '@/web3/utils'

export default {
  components: {
    UserLockedPairs
  },

  data: () => ({
    searchPair: '',
    lpAddress: null,
    balance: '0',
    loadingPair: false
  }),

  computed: {
    sClient () {
      return this.$store.state.signer
    },
    searchTextIsAddress () {
      return Utils.isValidAddress(this.searchPair)
    },
    uniBalanceHuman () {
      return 0
    },
  },

  watch: {
    searchPair (nv) {
      if (this.searchTextIsAddress) {
        console.log("Address checked!!!")
        this.loadDexPair(nv)
      } else {
        this.lpAddress = null
      }
    }
  },

  methods: {
    onSelectLockedPair (unipair) {
      this.$emit('on-continue', unipair)
    },
    loadDexPair (address) {
      console.log(address)
      this.loadingPair = true

      this.getUniBalance()
      
      this.loadingPair = false
    },
    async getUniBalance () {
      const balanceQuery = {
        balance: { address: this.sClient.address }
      }

      var balance = 0
      try {
        balance = await this.sClient.client.queryContractSmart(this.searchPair, balanceQuery)
        this.lpAddress = this.searchPair
        console.log("LP Balance", balance.balance)
      } catch (err) {
        console.log(err)
        console.log("Not LP/Token address")
      }

      if (balance > 0) {
        this.balance = balance
      }
    },
    connectWallet () {
      this.$root.$dialog.connectWalletDialog.open()
        .catch(e => {})
    },
  },

  created () {
    this.searchPair = ''
  }
}
</script>