<template>

  <div>

    <v-icon size="120" style="color: var(--v-background-base)!important; position: absolute; right: 30px; top: 0px;">mdi-lock-outline</v-icon>

    <div style="position: relative;">

      <div class="d-flex align-center title font-weight-bold mb-4">
        New Lock
      </div>

      <div class="mb-2">
        Use the locker to prove to investors you have locked liquidity. If you are not a token developer, this section is almost definitely not for you.
      </div>
      <div>
        Our locker offers:
        <ul>
          <!-- <li>Lock splitting</li>
          <li>Liquidity Migration</li> -->
          <li>Relocking</li>
          <li>Lock ownership transfer</li>
        </ul>
      </div>

      <div v-if="!sClient.address" class="mt-6 text-center">
        <v-btn
        @click="connectWallet"
        outlined
        color="primary"
        :class="['font-weight-bold mb-4']"
        rounded depressed
        >
            <span v-if="!sClient.address">Connect Wallet</span>
            <span v-else>Account: {{ sClient.address_condensed }}</span>
        </v-btn>
      </div>

      <template v-else>

        <div class="mt-8">
          Enter the pair address you would like to lock liquidity for
        </div>

        <div class="mt-2 d-flex align-center pa-3 r-outlined br-20 inputcolor">
          <c-input :value.sync="searchPair" :placeholder="`pair address...`">
          </c-input>
        </div>

        <div class="caption text-center textFaint--text">
          e.g. inj16ukv8g2jcmml7gykxn5ws8ykhxjkugl4zhft5h
        </div>

        <div v-if="loadingPair" class="mt-4 mb-4 text-center">
          <v-progress-circular
          indeterminate
          size="60"
          color="primary">
            <v-icon>mdi-lock</v-icon>
          </v-progress-circular>
          <div>
            Finding pair
          </div>
        </div>

        <v-slide-y-transition>
          <div v-if="lpAddress" class="v-card pa-4 br-20 mt-4">

            <div class="pb-2 t-large">
              Pair found
            </div>
            
            <v-btn @click="$emit('on-continue', lpAddress)" depressed rounded color="primary" block x-large class="mt-6">
              <span>CONTINUE</span>
            </v-btn>

          </div>
        </v-slide-y-transition>

        <!--
        <div v-for="token of usersLockedTokens" :key="token.address" @click="$emit('on-continue', token)">
          <div class="d-flex align-center pa-3 font-weight-bold">
            <coin-icon :address="token.token0.address"></coin-icon>
            <coin-icon :address="token.token1.address" class="mr-2"></coin-icon>
            {{ token.token0.symbol }} / {{ token.token1.symbol }}

            <v-spacer></v-spacer>

            {{ token.address }}

          </div>
        </div>
        -->

        <user-locked-pairs @on-select="onSelectLockedPair" :key="sClient.address" class="mt-8"></user-locked-pairs>

      </template>

    </div>

  </div>
</template>

<script>
// import _ from 'lodash'
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
      return 0;
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
    loadDexPair (address) {
      console.log(address)
      this.loadingPair = true

      this.getLPTokenBalance()
      
      this.loadingPair = false
    },
    onSelectLockedPair (unipair) {
      this.$emit('on-continue', unipair)
    },
    async getLPTokenBalance () {
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
        .then(() => {
        })
        .catch(e => {})
    },
  },

  created () {
    this.searchPair = ''
  }
}
</script>