<template>
  <v-dialog v-model="dialog" persistent max-width="450" content-class="br-20">
    <v-card class="br-20">

      <v-card-text>
        
        <v-row class="ma-0 align-center">
          <div class="pt-3 pb-3">
            Relock Tokens
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
            <div class="font-weight-bold">
              {{ unlockDateHuman }}
            </div>
            <div class="textFaint--text caption">
              {{ unlockDateFromNow }}
            </div>
          </div>
          <v-spacer></v-spacer>
          <c-date @setDate="setUnlockDate"></c-date>
        </div>

        <div v-if="lockDateInvalid" class="text-center caption orange--text">
          Lock date needs to be after current lock date
        </div>

        <div v-if="!tokenOnFeeWhitelist" class="text-center mt-3">
          Fee: {{ `${feeAmountHuman} ${reqNetwork}`}}
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
    fees: {
      fee: '0',
      mfee: '0',
    },
    tokenOnFeeWhitelist: false,
  }),

  computed: {
    sClient () {
      return this.$store.state.signer
    },
    reqNetwork () {
      return this.$store.state.requiredNetwork
    },
    feeAmountHuman () {
      var amount = Utils.convertMicroDenomToDenom(this.fees.mfee, 6)
      return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 4})
    },
    withdrawableBalanceHuman () {
      var amount = Utils.convertMicroDenomToDenom(this.lock.amount, 6)
      return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 4})
    },
    currentLockDateHuman () {
      return moment.unix(this.lock.end_emission).format('ddd D MMM YYYY HH:mm')
    },
    unlockDateHuman () {
      return moment.unix(this.unlockDate).format('ddd D MMM YYYY HH:mm')
    },
    unlockDateFromNow () {
      return moment.unix(this.unlockDate).fromNow()
    },
    lockDateInvalid () {
      return Number(this.unlockDate) <= Number(this.lock.end_emission)
    },
  },

  watch: {
    
  },

  methods: {
    open (lock) {
      this.lock = lock
      this.unlockDate = lock.end_emission
      this.dialog = true
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },
    cancel () {
      console.log("this.reject", this.reject)
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
      var fees = { fee: "750000", mfee: "250000"}
      this.fees = fees
    },
    async relock () {
      this.withdrawLoading = true
      const CONTRACT_ADDRESS = SETTINGS.CHAINS[this.reqNetwork].tokenLocker
      const defaultFee = SETTINGS.CHAINS[this.reqNetwork].defaultFee

      this.$root.$dialog.confirmTx.open()
      try {
        const txhash = await this.sClient.signedClient.execute(
          this.sClient.address,
          CONTRACT_ADDRESS,
          {
            "relock": {
              "lockid": this.lock.lock_id,
              "unlock_date": this.unlockDate
            }
          },
          defaultFee,
          undefined,
          [
            {
              amount: String(this.fees.mfee),
              denom: SETTINGS.CHAIN_UDENOM[this.reqNetwork]
            }
          ]
        )

        this.$root.$dialog.confirmTx.close()

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