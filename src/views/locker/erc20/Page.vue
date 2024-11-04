<template>
  <v-container style="max-width: 600px;" :class="[{'pa-0 foreground mobile-page': $vuetify.breakpoint.xs}]">
    <v-slide-x-transition appear>
      <div :class="['mb-16', {'pa-4': $vuetify.breakpoint.xs}, {'v-card br-20 pa-6': !$vuetify.breakpoint.xs}]">
        
        <div class="text-center">
          <img 
          src="@/assets/img/icons/padlock.svg" 
          height="60px"
          width="60px"
          class="greyscale">
        </div>

        <div class="title text-center textFaint--text mb-4">
          CW20 Token Locker
        </div>

        <div class="caption">
          CW20 Token locks in our token vesting locking pools are represented as shares of a pool, in a similar way to a dex pool, allowing support for all CW20 tokens including rebasing and deflationary mechanisms.
        </div>

        <div class="caption font-italic textFaint--text mb-4">
          This means lock amounts may change due to decimal rounding, but you will always retain your share of the pool.
        </div>

        <div class="caption font-italic orange--text mb-4">
          Do not lock Liquidity tokens here, they will <strong>not</strong> be shown in the Apexpad browser.
        </div>

        <div class="text-center py-2 mb-5">
          <div class="textFaint--text">
            Selected network
          </div>
          <v-btn large block outlined @click="$root.$dialog.chainSwitcher.open()" class="title">
            <img 
            :src="$settings.CHAINS[$store.state.requiredNetwork].icon" 
            height="24px"
            width="24px"
            class="mr-3 br-20">
            {{ $settings.CHAIN_DISPLAY_NAME[$store.state.requiredNetwork] }}
            <v-icon small color="">mdi-chevron-down</v-icon>
          </v-btn>
        </div>

        <v-btn v-if="!sClient.address" @click="connectWallet" 
        large block outlined class="title">
          <v-icon class="mr-3">mdi-wallet</v-icon>
          Connect your wallet
        </v-btn>

        <template v-else>

          <div :class="['mt-1 mb-2 d-flex align-center pa-3 r-outlined br-20 mx-2', {'foreground': $vuetify.breakpoint.xs}, {'inputcolor': !$vuetify.breakpoint.xs}]">
            <img 
            :src="$settings.CHAINS[$store.state.requiredNetwork].icon" 
            height="20px"
            width="20px"
            class="mr-2 br-20">
            <c-input :value.sync="tokenAddress" placeholder="Token address..." class="">
            </c-input>

            <v-progress-circular
            v-if="showSearchLoader"
            indeterminate
            width="2"
            class="mr-2"
            size="24"
            color="primary"
            ></v-progress-circular>

            <v-icon v-if="tokenAddress === ''">
              mdi-magnify
            </v-icon>
            <v-icon v-else @click="tokenAddress = ''">
              mdi-close
            </v-icon>

          </div>

          <div v-show="tokenHydrated.address">

            <v-card outlined class="v-card pa-4 br-20 green-button white--text">
              <div class="d-flex align-center white--text">
                <coin-icon :address="'addr'" class="mr-2"></coin-icon>
                {{ tokenHydrated.symbol }} 
                <span class="white--text ml-1">/ {{ tokenHydrated.name }}</span>
                <v-spacer></v-spacer>
                <div class="caption white--text">
                  {{ tokenHydrated.decimals }} decimals
                </div>
              </div>
              <div class="text-center">
                <div class="caption white--text font-italic mt-2">
                  Your balance
                </div>
                <div class="title">
                  {{ tokenBalanceHuman }} {{ tokenHydrated.symbol }} 
                </div>
                <v-spacer></v-spacer>
              </div>
            </v-card>

            <div class="mt-2 d-flex align-center mx-auto" style="max-width: 580px;flex: 1 1 0;">

              <div :class="['top-tab', {'active': tab === 0}]" @click="tab = 0">
                <v-icon size="20" class="mr-1">mdi-lock-outline</v-icon>
                <span>New lock</span>
              </div>

              <div :class="['top-tab', {'active': tab === 1}]" @click="tab = 1">
                <v-icon size="20" class="mr-1">mdi-lock</v-icon>
                <span>View locks</span>
              </div>

            </div>

            <!-- LOCK TAB -->
            <div v-show="tab == 0">
              <!-- LOCK ARRAY -->
              <div class="mt-5 v-card br-20">
                <div class="pa-4 border-b">
                  Locks 
                  <span class="textFaint--text">({{ locks.length }})</span>
                </div>
                <lock-row 
                v-for="lock of locks" 
                :key="lock.nonce"
                :lock="lock"
                :tokenHydrated="tokenHydrated"
                :balance="balance"
                @remove-lock="removeLock(lock.nonce)"
                @duplicate="duplicate(lock)">
                </lock-row>

                <div class="background border-b text-center py-2">
                  <v-btn small color="primary" @click="addLock">
                    <v-icon small>mdi-subdirectory-arrow-right</v-icon>
                    Add A lock
                  </v-btn>
                </div>

                <div class="background text-center caption text--text px-2 py-2">
                  <span class="font-weight-bold text--text">{{ totalLockAmountHuman }}</span>
                  /{{ tokenBalanceHuman }} <span class="font-weight-bold text--text">{{ tokenHydrated.symbol }}</span> 
                  total locked
                </div>

              </div>
              <!-- LOCK ARRAY -->

              <div>
                <div v-if="tokenOnFeeWhitelist" class="pa-8 br-20 text-center">
                  <v-icon size="60" color="textFaint">mdi-emoticon-excited-outline</v-icon>
                  <div class="textFaint--text">
                    No fees for this token!
                  </div>
                </div>

                <v-card v-else outlined class="pa-6 br-8 mt-4">
    
                  <div class="d-flex">
                    Fee: 
                    <v-spacer></v-spacer>
                    <!-- {{ fees.token_fee / 100 }} -->
                    {{ `${feeAmountHuman} ${reqNetwork}` }}
                  </div>
                  <div class="d-flex">
                    Total Debit: 
                    <v-spacer></v-spacer>
                    <span :class="[{'orange--text': errorInsufficientBalanceForLocks}]">{{ totalDebitAmountHuman }} {{ tokenHydrated.symbol }}</span>
                  </div>

                  <!-- <div class="text-center">
                    <v-btn outlined rounded @click="chargeFeeSeperately = !chargeFeeSeperately">
                      Charge fee seperately
                      <v-icon v-if="chargeFeeSeperately" color="primary" class="ml-3">mdi-check-circle-outline</v-icon>
                      <v-icon v-else class="ml-3" color="text">mdi-checkbox-blank-circle-outline</v-icon>
                    </v-btn>
                  </div>

                  <div class="mt-1 caption textFaint--text font-italic text-center">
                    Apply a fee to each lock, or pay it once seperately, paying the fee seperately helps ensure the amount of the lock matches the amount you entered.
                  </div> -->

                </v-card>
              </div>

              <div class="my-3 textFaint--text caption font-italic text-center">
                Once tokens are locked they cannot be withdrawn under any circumstances until the timer has expired. Please ensure the parameters are correct, as they are final.
              </div>

              <div v-if="errorTotalLockAmountIsZero" class="text-center orange--text py-2">
                Total Lock amount is Zero
              </div>

              <!-- <div v-if="locksContainSendToAnotherUser" :class="{'pa-4': $vuetify.breakpoint.xs}">
                <div class="my-2 d-flex align-center font-weight-medium midground pa-4 br-8" style="position: relative; overflow: hidden;">
                  <div class="orange" style="position: absolute; left: 0px; top: 0px; bottom: 0px; right: 0px;opacity: 0.2;">
                  </div>
                  <div>
                    <div class="d-flex align-center mb-2">
                      <img 
                      src="@/assets/img/flags/exclamation.svg" 
                      height="26px"
                      class="mr-2"
                      width="26px">
                      Attention!
                    </div>
                    <div class="caption font-weight-bold">
                      Some locks are being sent to users that are not your currently connected account!
                    </div>
                  </div>
                </div>
              </div> -->

              <div v-if="errorInsufficientBalanceForLocks" class="d-flex align-center font-weight-medium midground pa-4 br-8 mt-2" style="position: relative; overflow: hidden;">
                <div class="red" style="position: absolute; left: 0px; top: 0px; bottom: 0px; right: 0px;opacity: 0.2;">
                </div>
                <img 
                src="@/assets/img/flags/close.svg" 
                height="26px"
                class="mr-2"
                width="26px">
                <div>
                  <div class="caption">
                    You do not have enough {{ tokenHydrated.symbol }} for this transaction.
                    {{ totalDebitAmountHuman }}
                    {{ tokenHydrated.symbol }} required.
                  </div>
                </div>
              </div>

              <v-row dense class="ma-0 mt-4">
                <v-col cols="6">
                  <v-btn @click="approve" color="primary" x-large block depressed :disabled="!allowanceIncreaseRequired" :loading="approvalLoading">
                    Approve
                  </v-btn>
                </v-col>
                <v-col cols="6">
                  <v-btn @click="lockTokens" color="primary" x-large block depressed :disabled="allowanceIncreaseRequired" :loading="lockLoading">
                    Lock
                  </v-btn>
                </v-col>
              </v-row>
            </div>

            <div v-show="tokenHydrated.address && sClient.address && tab === 1" :class="[{'v-card br-20 mt-4': $vuetify.breakpoint.xs}, {'v-card br-20 mt-4': !$vuetify.breakpoint.xs}]">
              <global-token :tokenHydrated="tokenHydrated" :isForUser="true"></global-token>
            </div>

          </div>

        </template>

      </div>
    </v-slide-x-transition>

  </v-container>
</template>

<script>
import GlobalToken from './global-token/Main'
import LockRow from './lock-tokens/lock-row'
import moment from 'moment'
import Utils from '@/web3/utils'
import SETTINGS from '@/store/settings'

export default {
  components: {
    LockRow,
    GlobalToken
  },

  data: () => ({
    tab: 0,
    allowance: '0',
    balance: '0',
    tokenAddress: '',
    showSearchLoader: false,
    tokenHydrated: {},
    approvalLoading: false,
    lockLoading: false,
    locks: [], // [{amount, owner, start_emission, end_emission}]
    addNonce: -1, // unique nonce for each lock row
    fees: {
      fee: '0',
      mfee: '0',
    },
    tokenOnFeeWhitelist: false,
    chargeFeeSeperately: true
  }),

  computed: {
    sClient () {
      return this.$store.state.signer
    },
    sClientWatcher () {
      return this.sClient.watcher
    },
    reqNetwork () {
      return this.$store.state.requiredNetwork
    },
    tokenBalanceHuman () {
      return this.$root.formatAmount(this.balance, this.tokenHydrated.decimals)
    },
    tokenAddressCondensed () {
      var address = this.tokenHydrated.address
      if (!address) {
        return ''
      }
      return address.slice(0, 6) + '...' + address.slice(address.length - 4)
    },
    allowanceIncreaseRequired () {
      console.log("total lock amount", this.totalLockAmount)
      console.log("allowance", this.allowance)
      if (Number(this.totalLockAmount) > Number(this.allowance)) {
        return true
      }
      return false
    },
    totalLockAmount () {
      return this.locks.reduce((a, b) => {
        return Number(a) + Number(b.amount)
      }, '0').toString()
    },
    feeAmountHuman () {
      var amount = Utils.convertMicroDenomToDenom(Number(this.fees.fee) + Number(this.fees.mfee), this.tokenHydrated.decimals)
      return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})
    },
    totalLockAmountHuman () {
      var amount = Utils.convertMicroDenomToDenom(this.totalLockAmount, this.tokenHydrated.decimals)
      return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 9})
    },
    totalDebitAmount () {
      return this.totalLockAmount
    },
    locksContainSendToAnotherUser () {
      for (var lock of this.locks) {
        if (lock.owner !== this.sClient.address) {
          return true
        }
      }
      return false
    },
    totalDebitAmountHuman () {
      var amount = Utils.convertMicroDenomToDenom(this.totalDebitAmount, this.tokenHydrated.decimals)
      return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 9})
    },
    // freeLockingFeeHuman () {
    //   var amount = Utils.convertMicroDenomToDenom(this.fees.free_locking_fee, 6)
    //   return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 4})
    // },
    errorInsufficientBalanceForLocks () {
      console.log('balance = ', this.balance)
      console.log('total debit = ', this.totalDebitAmount)
      return Number(this.balance) < Number(this.totalDebitAmount)
    },
    errorTotalLockAmountIsZero () {
      console.log("total lock amount = ", this.totalLockAmount)
      return this.totalLockAmount === '0'
    }
  },

  watch: {
    tokenAddress () {
      this.loadToken()
    },
    sClientWatcher () {
      console.log('watcher is changed')
      this.loadToken()
      this.getFees()
    },
  },

  methods: {
    generateNonce () {
      this.addNonce++
      return this.addNonce
    },
    connectWallet () {
      this.$root.$dialog.connectWalletDialog.open()
        .then(() => {
        })
        .catch(e => {})
    },
    addLock () {
      this.locks.push({
        owner: this.sClient.address,
        amount: '0',
        start_emission: 0,
        end_emission: moment().unix(), // + 300,
        nonce: this.generateNonce()
      })
    },
    removeLock (nonce) {
      console.log("nonce", nonce)
      this.locks = this.locks.filter(item => item.nonce !== nonce)
    },
    duplicate (lock) {
      var copied = JSON.parse(JSON.stringify(lock))
      copied.nonce = this.generateNonce()
      this.locks.push(copied)
    },
    async getLocks () {
    },
    async lockTokens () {
      this.lockLoading = true
      var lockParams = this.locks

      for (let index = 0; index < lockParams.length; index++) {
        const element = lockParams[index]
        delete element.nonce
      }

      console.log("lock params = ", lockParams)
      const CONTRACT_ADDRESS = SETTINGS.CHAINS[this.reqNetwork].tokenLocker
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
            "lock": {
              "token": this.tokenAddress,
              "lock_params": lockParams,
            }
          },
          defaultFee,
          undefined,
          [
            {
              amount: String(Number(this.fees.fee) + Number(this.fees.mfee)),
              denom: SETTINGS.CHAIN_UDENOM[this.reqNetwork]
            }
          ]
        )

        this.$root.$dialog.confirmTx.close()

        console.log("lock txhash: ", txhash)
      } catch (err) {
        console.log(err)
        this.$root.$dialog.confirmTx.close()
        this.$root.$dialog.web3Error.open(err.message)
      }

      this.lockLoading = false
    },
    async approve () {
      const amount = '340282366920938463463374607431768211455'
      this.approvalLoading = true

      const CONTRACT_ADDRESS = SETTINGS.CHAINS[this.reqNetwork].tokenLocker
      console.log("CA = ", CONTRACT_ADDRESS)
      const defaultFee = SETTINGS.CHAINS[this.reqNetwork].defaultFee

      this.$root.$dialog.confirmTx.open()

      try {
        const txhash = await this.sClient.signedClient.execute(
          this.sClient.address,
          this.tokenAddress,
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
    async loadToken () {
      try {
        const contractInfo = await this.sClient.client.getContract(this.tokenAddress)
        console.log('Contract info = ', contractInfo);
      } catch (err) {
        console.error('Invalid address')
        this.tokenHydrated = {}
        return
      }

      this.showSearchLoader = true

      const tokenInfoQuery = { token_info: {} }
      try {
        var tokenInfo = await this.sClient.client.queryContractSmart(this.tokenAddress, tokenInfoQuery)  
        tokenInfo = {...tokenInfo, "address": this.tokenAddress}
        console.log("Token Info = ", tokenInfo)
        this.tokenHydrated = tokenInfo
        if (this.locks.length === 0) {
          this.addLock()
        }
        this.getTokenBalance()
        this.getAllowance()
      } catch (error) {
        this.tokenHydrated = {}
      }

      this.showSearchLoader = false
    },
    async getFees () {
      var fees = {fee: "750000", mfee:"250000"};
      this.fees = fees
    },
    async getTokenBalance () {
      if (!this.sClient.address || !this.tokenHydrated.address) {
        return
      }

      const balanceQuery = {
        balance: { address: this.sClient.address }
      }

      try {
        var balance = await this.sClient.client.queryContractSmart(this.tokenAddress, balanceQuery)
        this.balance = balance.balance
        console.log("Token balance = ", this.balance)
      } catch (err) {
        console.log(err)
      }
    },
    async getAllowance () {
      console.log("token hydrated = ", this.tokenHydrated)
      console.log("token address = ", this.tokenAddress)
      if (!this.sClient.address || !this.tokenHydrated.address) {
        return
      }

      console.log("token")
      const allowanceQuery = { allowance: {owner: this.sClient.address, spender: SETTINGS.CHAINS[this.reqNetwork].tokenLocker} }
      const allowanceInfo = await this.sClient.client.queryContractSmart(this.tokenAddress, allowanceQuery)
      this.allowance = allowanceInfo.allowance
      console.log("Allowance = ", this.allowance)
    },
  },

  created () {
    this.tokenAddress = this.$route.query.token || ''
    this.getFees()
  }
}
</script>