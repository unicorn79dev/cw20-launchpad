<template>
  <v-dialog v-model="dialog" persistent max-width="450" content-class="br-20">
    <v-card class="br-20">

      <v-card-text>
        
        <v-row class="ma-0 align-center">
          <div class="pt-3 pb-3">
            Relock Liquidity
          </div>
          <v-spacer></v-spacer>
          <v-btn @click="cancel" large icon color="textFaint">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-row>

        <div class="mt-10">
          Current lock date
        </div>

        <div>
          {{ currentLockDateHuman }}
        </div>

        <div class="mt-10">
          New Unlock Date
        </div>

        <div class="d-flex align-center inputcolor r-outlined pa-4">
          <div>
            <div class="font-weight-bold title">
              {{ unlockDateHuman }}
            </div>
            <div class="textFaint--text">
              {{ unlockDateFromNow }} (unix {{ unlockDate }})
            </div>
          </div>
          <v-spacer></v-spacer>
          <c-date @setDate="setUnlockDate"></c-date>
        </div>

        <div v-if="lockDateInvalid" class="text-center pink--text">
          Lock date needs to be after current lock date
        </div>

        <div class="text-center mt-3">
          Fee: {{ `${liquidityFee} ${reqNetwork}`}}
        </div>

      </v-card-text>

      <v-row dense class="ma-2">
        <v-btn x-large block rounded @click="relock" class="white--text grad-green" :loading="withdrawLoading">
          Relock
          <v-icon class="ml-2">mdi-lock-outline</v-icon>
        </v-btn>
      </v-row>

    </v-card>
  </v-dialog>
</template>

<script>
import CDate from '@/components/ui/date-picker'
import moment from 'moment'
import Utils from '@/web3/utils'
import SETTINGS from '@/store/settings'

export default {
  components: {
    CDate
  },
  data: () => ({
    dialog: false,
    resolve: null,
    reject: null,
    unlockDate: '0',
    amount: '0',
    amountHuman: '0',
    loading: true,
    withdrawLoading: false,
    lock: {},
    unipair: {},
    feeInfo: {}
  }),

  computed: {
    sClient () {
      return this.$store.state.signer
    },
    reqNetwork () {
      return this.$store.state.requiredNetwork
    },
    withdrawableBalanceHuman () {
      var amount = Utils.convertMicroDenomToDenom(this.lock.amount, 6)
      return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 4})
    },
    currentLockDateHuman () {
      return moment.unix(this.lock.unlock_date).format('ddd D MMM YYYY HH:mm')
    },
    unlockDateHuman () {
      return moment.unix(this.unlockDate).format('ddd D MMM YYYY HH:mm')
    },
    unlockDateFromNow () {
      return moment.unix(this.unlockDate).fromNow()
    },
    lockDateInvalid () {
      return Number(this.unlockDate) <= Number(this.lock.unlock_date)
    },
    ethFee () {
      var months = parseInt((this.unlockDate - moment.now() / 1000) / 2628000 + 1)
      var totalFee = this.feeInfo.mfee * months

      return totalFee
    },
    liquidityFee () {
      return 2.5
      // return this.feeInfo.liquidity_fee / 10
    },
  },

  watch: {
    
  },

  methods: {
    open (lock, unipair) {
      this.lock = lock
      this.unipair = unipair
      this.unlockDate = lock.unlock_date
      this.dialog = true
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },
    cancel () {
      this.reject()
      this.dialog = false
    },
    setUnlockDate (date) {
      this.unlockDate = date.unix()
    },
    onHumanAmountChange (val) {
      this.amount = Utils.convertDenomToMicroDenom(val, 6)
    },
    async getFees () {
      var feeInfo = {"fee": 750000, "mfee": 250000}
      this.feeInfo = feeInfo
    },
    async relock () {
      this.withdrawLoading = true
      const CONTRACT_ADDRESS = SETTINGS.CHAINS[this.reqNetwork].lpLocker
      const defaultFee = SETTINGS.CHAINS[this.reqNetwork].defaultFee

      this.$root.$dialog.confirmTx.open()
      try {
        const txhash = await this.sClient.signedClient.execute(
          this.sClient.address,
          CONTRACT_ADDRESS,
          {
            "relock": {
              "lptoken": this.unipair,
              "index": this.lock.user_lock_index,
              "lockid": this.lock.lockid,
              "unlock_date": this.unlockDate
            }
          },
          defaultFee,
          undefined,
          [
            {
              amount: String(this.ethFee),
              denom: SETTINGS.CHAIN_UDENOM[this.reqNetwork]
            }
          ]
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
    this.getFees()
      .then(() => {
      })
      .catch(e => {})
      .then(() => {
        this.loading = false
      })
  }
}
</script>