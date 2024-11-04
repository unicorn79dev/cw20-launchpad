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

        <!-- {{ lock }}
        {{ unipair }} -->

        <div  class="pa-1">

          <template>
            <div class="pa-1 align-center flex-nowrap inputcolor r-outlined">
              <div class="caption text-end mr-3 pt-2">
                Balance: {{ uniBalanceHuman }}
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

        <div class="text-center mt-3">
          {{ `Fee: ${feeHuman} ${reqNetwork}`}}
          <!-- No fee on increment lock -->
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
    unipair: null,
    feeInfo: {}
  }),

  computed: {
    sClient () {
      return this.$store.state.signer
    },
    reqNetwork () {
      return this.$store.state.requiredNetwork
    },
    uniBalanceHuman () {
      var amount = Utils.convertMicroDenomToDenom(this.balance, this.decimals)
      return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 5})
    },
    allowanceIncreaseRequired () {
      if (Number(this.amount) > Number(this.allowance)) {
        return true
      }
      return false
    },
    feeHuman () {
      var amount = Utils.convertMicroDenomToDenom(this.feeInfo.mfee, this.decimals)
      return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 5})
    },
  },

  watch: {
    
  },

  methods: {
    open (lock, unipair) {
      this.lock = lock
      this.unipair = unipair
      this.dialog = true
      this.getUniBalance()
      this.getAllowance()
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },
    setMax () {
      this.amount = this.balance
      this.amountHuman = Utils.convertMicroDenomToDenom(this.balance, this.decimals)
    },
    cancel () {
      this.reject()
      this.dialog = false
    },
    async getUniBalance () {
      const balanceQuery = {
        balance: { address: this.sClient.address }
      }

      var balance = await this.sClient.client.queryContractSmart(this.unipair, balanceQuery)
      this.balance = balance.balance
    },
    async getAllowance () {
      const allowanceQuery = { allowance: {owner: this.sClient.address, spender: SETTINGS.CHAINS[this.reqNetwork].lpLocker} }
      const allowanceInfo = await this.sClient.client.queryContractSmart(this.unipair, allowanceQuery)
      this.allowance = allowanceInfo.allowance
      console.log("Allowance = ", this.allowance)
    },
    onHumanAmountChange (val) {
      this.amount = Utils.convertDenomToMicroDenom(val, this.decimals)
    },
    async approve () {
      const amount = '340282366920938463463374607431768211455'
      this.approvalLoading = true

      const CONTRACT_ADDRESS = SETTINGS.CHAINS[this.reqNetwork].lpLocker
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

      const CONTRACT_ADDRESS = SETTINGS.CHAINS[this.reqNetwork].lpLocker // 'sei1e3gyn7ynfwxghmvflrz9knlkwd5wh6z92zk7n44vaxth3vcgc7qq2kgwx7'
      const defaultFee = SETTINGS.CHAINS[this.reqNetwork].defaultFee

      this.$root.$dialog.confirmTx.open()

      console.log(this.sClient.signedClient);
      
      try {
        const txhash = await this.sClient.signedClient.execute(
          this.sClient.address,
          CONTRACT_ADDRESS,
          {
            "increment_lock": {
              "lptoken": this.unipair,
              "index": this.lock.user_lock_index,
              "lockid": this.lock.lockid,
              "amount": amount.toString(),
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
    },
    async getFees () {
      var feeInfo = {"fee": 750000, "mfee": 250000}
      this.feeInfo = feeInfo
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