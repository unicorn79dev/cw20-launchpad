<template>
  <v-dialog v-model="dialog" persistent max-width="450" content-class="br-20">
    <v-card class="br-20">

      <v-card-text>
        
        <v-row class="ma-0 align-center">
          <div class="pt-3 pb-3">
            Increase Lock
          </div>
          <v-spacer></v-spacer>
          <v-btn @click="cancel" icon large color="textFaint">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-row>

        <div  class="pa-1">

          <template>
            <div class="pa-1 align-center flex-nowrap inputcolor r-outlined">
              <div class="caption text-end mr-3 pt-2">
                Balance: {{ tokenBalanceHuman }}
              </div>
              <div class="d-flex align-center">
                <c-input :value.sync="amountHuman" placeholder="0.0" @updateWhileFocussed="onHumanAmountChange" class="pa-2 title font-weight-bold">
                </c-input>
                {{ tokenHydrated.symbol }}
                <v-btn small outlined rounded @click="setMax" class="mr-2 grad-green white--text">
                  MAX
                </v-btn>
              </div>
            </div>
          </template>

        </div>

        <div class="text-center mt-3">
          Fee: {{ `${feeAmountHuman} ${reqNetwork}`}}
        </div>

        <div v-if="lock.owner !== sClient.address" class="caption orange--text text-center">
          CAUTION: You are not this locks owner. You will be increasing the value of someone elses lock.
          <div class="textFaint--text font-italic">
            Lock Owner:
          </div>
          <div class="textFaint--text font-italic">
            {{ lock.owner }}
          </div>
        </div>

      </v-card-text>

      <v-row dense class="ma-2 mt-3">
        <v-col cols="6">
          <v-btn @click="approve" x-large block depressed :disabled="!allowanceIncreaseRequired" :loading="approvalLoading" class="white--text grad-green">
            Approve
          </v-btn>
        </v-col>
        <v-col cols="6">
          <v-btn @click="incrementLock" x-large block depressed :disabled="allowanceIncreaseRequired || amount === '0'" :loading="withdrawLoading" class="white--text grad-green">
            Lock
            <v-icon class="ml-2">mdi-arrow-up</v-icon>
          </v-btn>
        </v-col>
      </v-row>

    </v-card>
  </v-dialog>
</template>

<script>
import CInput from '@/components/ui/input'
import SETTINGS from '@/store/settings'
import Utils from '@/web3/utils'

export default {
  components: {
    CInput
  },
  data: () => ({
    dialog: false,
    resolve: null,
    reject: null,
    balance: '0',
    allowance: '0',
    amount: '0',
    amountHuman: '0',
    loading: false,
    withdrawLoading: false,
    approvalLoading: false,
    lock: {},
    fees: {
      token_fee: '0',
      free_locking_fee: '0',
      free_locking_token: ''
    },
    tokenHydrated: {
      decimals: '0'
    },
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
    tokenBalanceHuman () {
      var amount = Utils.convertMicroDenomToDenom(this.balance, this.tokenHydrated.decimals)
      return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 9})
    },
    allowanceIncreaseRequired () {
      if (Number(this.amount) > Number(this.allowance)) {
        return true
      }
      return false
    },
  },

  watch: {
    
  },

  methods: {
    open (lock, _tokenHydrated) {
      this.lock = lock
      this.tokenHydrated = _tokenHydrated
      this.dialog = true
      this.getTokenBalance()
      this.getAllowance()
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },
    setMax () {
      this.amount = this.balance
      this.amountHuman = Utils.convertMicroDenomToDenom(this.balance, this.tokenHydrated.decimals)
    },
    cancel () {
      this.dialog = false
    },
    async getTokenBalance () {
      console.log("signer", this.sClient.address)
      console.log("token", this.tokenHydrated.address)
      if (!this.sClient.address || !this.tokenHydrated.address) {
        return
      }
      const balanceQuery = {
        balance: { address: this.sClient.address }
      }
      var balance = await this.sClient.client.queryContractSmart(this.tokenHydrated.address, balanceQuery)
      console.log("balance", balance)
      this.balance = balance.balance
    },
    async getAllowance () {
      if (!this.sClient.address || !this.tokenHydrated.address) {
        return
      }
      const allowanceQuery = { allowance: {owner: this.sClient.address, spender: SETTINGS.CHAINS[this.reqNetwork].tokenLocker} }
      const allowanceInfo = await this.sClient.client.queryContractSmart(this.tokenHydrated.address, allowanceQuery)
      this.allowance = allowanceInfo.allowance
    },
    onHumanAmountChange (val) {
      this.amount = Utils.convertDenomToMicroDenom(val, this.tokenHydrated.decimals)
    },
    async approve () {
      const amount = '340282366920938463463374607431768211455'
      this.approvalLoading = true

      const CONTRACT_ADDRESS = SETTINGS.CHAINS[this.reqNetwork].tokenLocker
      const defaultFee = SETTINGS.CHAINS[this.reqNetwork].defaultFee

      this.$root.$dialog.confirmTx.open()

      try {
        const txhash = await this.sClient.signedClient.execute(
          this.sClient.address,
          this.unipair,
          {
            "increase_allowance": {
              "spender": CONTRACT_ADDRESS,
              "amount": amount.toString(),
            }
          },
          defaultFee,
          undefined,
          []
        )

        console.log("txhash", txhash)
        this.getAllowance()
        this.$root.$dialog.confirmTx.close()
      } catch (err) {
        console.log(err)
        this.$root.$dialog.confirmTx.close()
        this.$root.$dialog.web3Error.open(err.message)
      }

      this.approvalLoading = false
    },
    async incrementLock () {
      this.withdrawLoading = true
      var amount = parseInt(this.amount)

      const CONTRACT_ADDRESS = SETTINGS.CHAINS[this.reqNetwork].tokenLocker
      const defaultFee = {
        amount: [],
        gas: "500000",
      }

      this.$root.$dialog.confirmTx.open()

      console.log(this.sClient.signedClient);
      
      try {
        const txhash = await this.sClient.signedClient.execute(
          this.sClient.address,
          CONTRACT_ADDRESS,
          {
            "increment_lock": {
              "amount": amount.toString(),
              "lockid": this.lock.lock_id,
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
    },
    async getFees () {
      var fees = {"fee": 750000, "mfee": 250000}
      this.fees = fees
    },
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