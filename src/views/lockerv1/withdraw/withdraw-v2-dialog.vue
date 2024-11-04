<template>
  <v-dialog v-model="dialog" persistent max-width="450" content-class="br-20">
    <v-card>

      <v-card-text>
        
        <v-row class="ma-0 align-center">
          <div class="pt-3 pb-3">
            Withdraw Liquidity
          </div>
          <v-spacer></v-spacer>
          <v-btn @click="cancel" large icon color="textFaint">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-row>

        <!-- {{ lock }}
        {{ unipair }} -->

        <div  class="pa-1">

          <template>
            <div class="pa-1 align-center flex-nowrap inputcolor r-outlined">
              <div class="caption text-end mr-3 pt-2">
                Withdrawable: {{ withdrawableBalanceHuman }}
              </div>
              <div class="d-flex align-center">
                <c-input :value.sync="amountHuman" placeholder="0.0" @updateWhileFocussed="onHumanAmountChange" class="pa-2 title font-weight-bold">
                </c-input>
                <v-btn small outlined rounded @click="setMax" class="mr-2 grad-green white--text">
                  MAX
                </v-btn>
              </div>
            </div>
          </template>

        </div>

        <!--
        <div>
          {{ amount }}
        </div>
        -->

      </v-card-text>

      <v-row dense class="ma-2">
        <v-btn x-large rounded block @click="withdraw" color="primary" class="white--text grad-green" :loading="withdrawLoading">
          Withdraw
          <v-icon class="ml-2">mdi-arrow-up</v-icon>
        </v-btn>
      </v-row>

    </v-card>
  </v-dialog>
</template>

<script>
import CInput from '@/components/ui/input'
import Utils from '@/web3/utils'
import SETTINGS from '@/store/settings'

export default {
  components: {
    CInput
  },
  data: () => ({
    decimals: 6,
    dialog: false,
    resolve: null,
    reject: null,
    amount: '0',
    amountHuman: '0',
    lpTokenAddress: '',
    loading: false,
    withdrawLoading: false,
    lock: {
      amount: '0'
    },
    unipair: null
  }),

  computed: {
    sClient () {
      return this.$store.state.signer
    },
    reqNetwork () {
      return this.$store.state.requiredNetwork
    },
    withdrawableBalanceHuman () {
      var amount = Utils.convertMicroDenomToDenom(this.lock.amount, this.decimals)
      return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 4})
    },
  },

  watch: {
    
  },

  methods: {
    open (lock, unipair) {
      this.lock = lock
      this.unipair = unipair
      this.dialog = true
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },
    setMax () {
      this.amount = this.lock.amount
      this.amountHuman = Utils.convertMicroDenomToDenom(this.lock.amount, this.decimals)
    },
    cancel () {
      this.reject()
      this.dialog = false
    },
    onHumanAmountChange (val) {
      this.amount = Utils.convertDenomToMicroDenom(this.lock.amount, this.decimals)
    },
    async withdraw () {
      this.withdrawLoading = true
      const CONTRACT_ADDRESS = SETTINGS.CHAINS[this.reqNetwork].lpLocker
      const defaultFee = SETTINGS.CHAINS[this.reqNetwork].defaultFee

      this.$root.$dialog.confirmTx.open()
      try {
        const txhash = await this.sClient.signedClient.execute(
          this.sClient.address,
          CONTRACT_ADDRESS,
          {
            "withdraw": {
              "lptoken": this.unipair,
              "index": this.lock.user_lock_index,
              "lockid": this.lock.lockid,
              "amount": this.amount
            }
          },
          defaultFee,
          undefined,
          []
        )

        this.$root.$dialog.confirmTx.close()

        this.resolve()
        this.dialog = false

        console.log("lock txhash: ", txhash)
      } catch (err) {
        console.log(err)
        this.$root.$dialog.confirmTx.close()
        this.$root.$dialog.web3Error.open(err.message)
      }

      this.withdrawLoading = false
    }
  },

  created () {
    this.filteredTokens = this.savedTokens
  }
}
</script>