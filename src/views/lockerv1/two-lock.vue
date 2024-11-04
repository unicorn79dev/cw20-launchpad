<template>
  <div>

    <v-icon size="180" style="color: var(--v-background-base)!important; position: absolute; right: -30px; top: -10px;">mdi-lock-outline</v-icon>

    <div style="position: relative;">

      <div v-if="firstLoad" class="text-center">
        <v-progress-circular
        indeterminate
        size="150"
        color="textFaint">
          <v-icon size="100" color="textFaint">mdi-lock-outline</v-icon>
        </v-progress-circular>
      </div>

      <v-scroll-x-transition>
        <div>

          <div class="display-1 textFaint--text text-center font-weight-bold mb-8">
            Lock Liquidity
          </div>

          <div v-if="false" class="caption">
            {{ feeInfo }}
          </div>

          <!-- <div class="d-flex align-center justify-center t-large">
            <coin-icon :address="'address-0'" class="mr-2"></coin-icon>
            {{ 'symbol-0' }} / {{ 'symbol-1' }}
            <coin-icon :address="'address-1'" class="ml-2 mr-2"></coin-icon>
          </div> -->

          <div class="mt-10 mb-2 title font-weight-bold text-center">
            Lock how many LP tokens?
          </div>

          <div class="pa-4 align-center flex-nowrap inputcolor r-outlined">

            <div class="caption text-end pt-2">
              Balance: {{ uniBalanceHuman }}
            </div>

            <div class="d-flex align-center">
              <c-input :value.sync="amountHuman" placeholder="0.0" @updateWhileFocussed="onHumanAmountChange" class="pa-2 font-weight-bold">

              </c-input>

              <div class="font-weight-bold">
                LP
              </div>

              <v-btn small depressed color="primary" @click="setMax" class="ml-2">
                MAX
              </v-btn>
            </div>

            <div>
              <v-btn small outlined rounded color="" @click="setPercent(25)" class="mr-1">
                25%
              </v-btn>
              <v-btn small outlined rounded color="" @click="setPercent(50)" class="mr-1">
                50%
              </v-btn>
              <v-btn small outlined rounded color="" @click="setPercent(75)" class="mr-1">
                75%
              </v-btn>
              <v-btn small outlined rounded color="" @click="setMax" class="mr-1">
                100%
              </v-btn>
            </div>

          </div>

          <div class="mt-10 mb-2 title font-weight-bold text-center">
            Unlock Date
          </div>

          <div class="d-flex align-start inputcolor r-outlined pa-4">
            <div>
              <div class="font-weight-bold">
                {{ unlockDateHuman }}
              </div>
              <div class="">
                {{ unlockDateFromNow }} <!-- (unix {{ unlockDate }}) -->
              </div>
            </div>
            <v-spacer></v-spacer>
            <c-date @setDate="setUnlockDate"></c-date>
          </div>

          <div class="mt-10 mb-2 title font-weight-bold text-center">
            Who can withdraw the tokens?
          </div>

          <div class="text-center">
            <v-btn depressed :color="unlockerIsMe ? 'primary' : ''" @click="unlockerIsMe = true">
              Me
            </v-btn>
            <v-btn depressed :color="!unlockerIsMe ? 'primary' : ''" @click="unlockerIsMe = false">
              Someone else
            </v-btn>
          </div>

          <v-slide-y-transition>
            <div v-if="!unlockerIsMe" class="mt-2 d-flex align-center pa-3 r-outlined br-8 inputcolor">
              <c-input :value.sync="unlockerAccount" placeholder="Unlocker address">
              </c-input>
            </div>
          </v-slide-y-transition>

          <!-- <div v-if="whitelisted">
            <div class="mt-10 mb-2 title font-weight-bold text-center">
              Fees
            </div>

            <v-card
            class="pa-4"
            > 
              <div :class="['title text-center']">
                {{ liquidityFee }}% UNIV2
              </div>
              <div class="textFaint--text justify-center d-flex align-center mt-2 caption">
                <v-icon color="textFaint" class="mr-2">mdi-checkbox-marked-circle-outline</v-icon>
                Your account is whitelisted for less fees
              </div>
            </v-card>
          </div> -->

          <template>

            <div class="mt-10 mb-2 title font-weight-bold text-center">
              Fee
            </div>

            <v-item-group v-model="optionEthFee" mandatory>
              <v-container>
                <v-row dense class="justify-center">
                  <v-col cols="6">
                    <v-item v-slot="{ active, toggle }">
                      <v-card
                        :color="active ? 'primary' : ''"
                        :class="['d-flex align-center']"
                        height="100"
                        @click="toggle"
                      >
                        <div :class="['title flex-grow-1 text-center', {'white--text': active}]">
                          {{ ethFeeHuman }}
                          {{ $store.state.nativeGasTokenSymbol }}
                          <!-- <div class="caption">
                            ( = {{ feeInfo.fee / 1000000 }} + {{ feeInfo.mfee / 1000000 }} x months )
                          </div> -->
                        </div>
                      </v-card>
                    </v-item>
                    <div class="caption textFaint--text text-center">
                      Your balance: {{ ethBalanceHuman }} {{ $store.state.nativeGasTokenSymbol }}
                    </div>
                  </v-col>
                </v-row>
              </v-container>
            </v-item-group>
          </template>

          <div class="mt-8 text-center">
            Once tokens are locked they cannot be withdrawn under any circumstances until the timer has expired. Please ensure the parameters are correct, as they are final.
          </div>

          <!-- <div class="ma-0 mt-4">
            <v-btn @click="lockTokens" color="primary" x-large block depressed :disabled="allowanceIncreaseRequired || amount === '0' || !userHasSufficientFlatrateToken" :loading="lockLoading">
              Lock
            </v-btn>
          </div> -->
          <v-row dense class="ma-0 mt-4">
            <v-col cols="6">
              <v-btn @click="approve" color="primary" x-large block depressed :disabled="!allowanceIncreaseRequired" :loading="approvalLoading">
                Approve
              </v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn @click="lockTokens" color="primary" x-large block depressed :disabled="allowanceIncreaseRequired || amount === '0' || !userHasSufficientFlatrateToken" :loading="lockLoading">
                Lock
              </v-btn>
            </v-col>
          </v-row>

          <div v-if="!userHasSufficientFlatrateToken" class="d-flex align-center font-weight-medium midground pa-4 br-8 mt-2" style="position: relative; overflow: hidden;">
            <div class="red" style="position: absolute; left: 0px; top: 0px; bottom: 0px; right: 0px;opacity: 0.2;">
            </div>
            <img 
            src="@/assets/img/flags/close.svg" 
            height="26px"
            class="mr-2"
            width="26px">
            <div>
              <div class="caption">
                You do not have enough {{ $store.state.nativeGasTokenSymbol }} in your wallet to perform this transaction.
                {{ ethFeeHuman }}
                {{ $store.state.nativeGasTokenSymbol }} required.
              </div>
            </div>
          </div>

        </div>
      </v-scroll-x-transition>

    </div>

  </div>
</template>

<script>
import CDate from '@/components/ui/date-picker'
import moment from 'moment'
import SETTINGS from '@/store/settings'
import Utils from '@/web3/utils'

export default {
  props: {
    uniPair : String
  },

  components: {
    CDate
  },

  data: () => ({
    balance: '0',
    decimals: '6',
    secondaryFeeBalance: '0',
    ethBalance: '0',
    amount: '0',
    amountHuman: '0',
    unlockDate: '0',
    allowance: '0',
    secondaryAllowance: '0',
    unlockerAccount: '',
    approvalLoading: false,
    lockLoading: false,
    firstLoad: true,
    optionEthFee: 0,
    unlockerIsMe: true,
    referrerBalanceMet: false,
    whitelisted: false,
    feeInfo: {}
  }),

  computed: {
    sClient () {
      return this.$store.state.signer
    },
    reqNetwork () {
      return this.$store.state.requiredNetwork
    },
    sClientWatcher () {
      return this.sClient.watcher
    },
    secondaryFeeHuman () {
      return 0
    },
    ethFee () {
      var months = parseInt((this.unlockDate - moment.now() / 1000) / 2628000 + 1)
      var totalFee = this.feeInfo.fee + this.feeInfo.mfee * months

      return totalFee
    },
    ethFeeHuman () {
      var months = parseInt((this.unlockDate - moment.now() / 1000) / 2628000 + 1)
      var totalFee = this.feeInfo.fee + this.feeInfo.mfee * months

      var amount = Utils.convertMicroDenomToDenom(totalFee, this.decimals)
      return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})
    },
    liquidityFee () {
      return this.feeInfo.liquidity_fee / 10
    },
    liquidityFeeSecondary () {
      return (this.feeInfo.liquidity_fee / 10) * ((1000 - this.feeInfo.secondary_token_discount) / 1000)
    },
    uniBalanceHuman () {
      var amount = Utils.convertMicroDenomToDenom(this.balance, this.decimals)
      return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 5})
    },
    secondaryFeeBalanceHuman () {
      return 0
    },
    ethBalanceHuman () {
      var amount = Utils.convertMicroDenomToDenom(this.ethBalance, SETTINGS.CHAIN_DECIMALS[this.requiredNetwork])
      return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})
    },
    unlockDateHuman () {
      return moment.unix(this.unlockDate).format('ddd D MMM YYYY HH:mm')
    },
    unlockDateFromNow () {
      return moment.unix(this.unlockDate).fromNow()
    },
    userHasSufficientFlatrateToken () {
      var months = parseInt((this.unlockDate - moment.now() / 1000) / 2628000)
      console.log("Balance + fee", this.ethBalance, months)
      return this.ethBalance > this.feeInfo.fee + this.feeInfo.mfee * months
    },
    allowanceIncreaseRequired () {
      if (Number(this.amount) > Number(this.allowance)) {
        return true
      }
      return false
    },
    secondaryAllowanceIncreaseRequired () {
      return true
    },
  },

  watch: {
    sClientWatcher () {
      this.getUniBalance()
      this.getUniDecimals()
      this.getAllowance()
      this.getEthBalance()
    }
  },

  methods: {
    async getUniBalance () {
      const balanceQuery = {
        balance: { address: this.sClient.address }
      }

      var balance = await this.sClient.client.queryContractSmart(this.uniPair, balanceQuery)
      this.balance = balance.balance
    },
    async getUniDecimals () {
      const tokenInfoQuery = { token_info: {} }
      const tokenInfo = await this.sClient.client.queryContractSmart(this.uniPair, tokenInfoQuery)
      this.decimals = tokenInfo.decimals
    },
    async getSecondaryFeeBalance () {
    },
    async getEthBalance () {
      console.log("get coin balance")
      if (!this.sClient.address) {
        return
      }

      var ethBalance = await this.sClient.client.getBalance(this.sClient.address, this.sClient.denom)
      this.ethBalance = ethBalance.amount
    },
    async getAllowance () {
      const allowanceQuery = { allowance: {owner: this.sClient.address, spender: SETTINGS.CHAINS[this.reqNetwork].lpLocker} }
      const allowanceInfo = await this.sClient.client.queryContractSmart(this.uniPair, allowanceQuery)
      this.allowance = allowanceInfo.allowance
      console.log("Allowance = ", this.allowance)
    },
    onHumanAmountChange (val) {
      this.amount = Utils.convertDenomToMicroDenom(val, this.decimals)
    },
    setMax () {
      this.amount = this.balance
      this.amountHuman = Utils.convertMicroDenomToDenom(this.balance, this.decimals)
    },
    setPercent (percent) {
      this.amount = this.balance * percent / 100
      this.amountHuman = Utils.convertMicroDenomToDenom(this.amount, this.decimals)
    },
    setUnlockDate (date) {
      this.unlockDate = date.unix()
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
          this.uniPair,
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
    approveSecondary () {
    },
    async getFees () {
      var feeInfo = {"fee": 750000, "mfee": 250000}
      this.feeInfo = feeInfo
    },
    async getUserWhitelistStatus () {
    },
    async lockTokens () {
      this.lockLoading = true
      var amount = parseInt(this.amount)
      var unlocker = this.unlockerIsMe ? this.sClient.address : this.unlockerAccount

      console.log("Unlocker address = ", unlocker)
      const CONTRACT_ADDRESS = SETTINGS.CHAINS[this.reqNetwork].lpLocker // 'sei1e3gyn7ynfwxghmvflrz9knlkwd5wh6z92zk7n44vaxth3vcgc7qq2kgwx7'
      const defaultFee = {
        amount: [],
        gas: "500000",
      }

      this.$root.$dialog.confirmTx.open()

      try {
        const txhash = await this.sClient.signedClient.execute(
          this.sClient.address,
          CONTRACT_ADDRESS,
          {
            "lock_l_p_token": {
              "lptoken": this.uniPair,
              "amount": amount.toString(),
              "unlock_date": Number(this.unlockDate),
              "withdrawer": unlocker
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

        this.$emit('on-lock', amount)
        console.log("lock txhash: ", txhash)
      } catch (err) {
        console.log(err)
        this.$root.$dialog.confirmTx.close()
        this.$root.$dialog.web3Error.open(err.message)
      }

      this.lockLoading = false
    },
    async doFirstLoad () {
      await this.getFees()
      await this.getUniBalance()
      await this.getAllowance()
      await this.getUserWhitelistStatus()
      this.getSecondaryFeeBalance()
      this.getEthBalance()
    }
  },

  created () {
    this.doFirstLoad()
      .then(() => {})
      .catch(e => {})
      .then(() => {
        this.firstLoad = false
      })
    this.unlockDate = moment().add(6, 'M').unix()
  }
}
</script>