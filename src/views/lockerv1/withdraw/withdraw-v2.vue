<template>
  <div>

    <div v-if="loading" class="text-center mt-6">
      <v-progress-circular
      indeterminate
      size="80"
      color="textFaint">
        <v-icon size="60" color="textFaint">mdi-lock-outline</v-icon>
      </v-progress-circular>
    </div>
    <v-scroll-x-transition>
      <div v-if="!loading">

        <div class="display-1 textFaint--text font-weight-bold mb-7">
          Withdraw liquidity
        </div>

        <div class="pa-4 mb-2 text-center">
          <!-- <div class="d-flex mb-3 align-center justify-center title font-weight-bold">
            <coin-icon :address="'addr0'" style="z-index: 1;"></coin-icon>
            <coin-icon :address="'addr1'" class="mr-2" style="margin-left: -10px;"></coin-icon>
            <span class="title">
              {{ 'sym0' }}
            </span>
            <span class="textFaint--text">
              /
            </span>
            <span class="title">
              {{ 'sym1' }}
            </span>
          </div>
          <div class="">
            {{ 'name0' }} /
            {{ 'name1' }}
          </div> -->
          <copy-address :address="uniPair" color="textFaint"></copy-address>
        </div>

        <div class="mt-8">
          <deposit-row v-for="lock of locks" :key="lock.lockID" :item="lock" :totalSupply="tokenInfo.total_supply" 
          @withdraw="withdraw" @migrate="migrate" @relock="relock" @transfer-ownership="transferOwnership" 
          @increment="increment" @split="split">
          </deposit-row>
        </div>

        <div v-if="locks.length === 0">
          No locks for this account
        </div>

        <withdraw-dialog ref="withdrawDialog"></withdraw-dialog>

        <relock-dialog ref="relockDialog"></relock-dialog>

        <transfer-ownership-dialog ref="transferOwnershipDialog"></transfer-ownership-dialog>

        <migrate-dialog ref="migrateDialog"></migrate-dialog>

        <increment-dialog ref="incrementDialog"></increment-dialog>

        <split-lock-dialog ref="splitLockDialog"></split-lock-dialog>

      </div>
    </v-scroll-x-transition>

  </div>
</template>

<script>
import DepositRow from './deposit-row-v2'
import WithdrawDialog from './withdraw-v2-dialog'
import MigrateDialog from './migrate-dialog'
import IncrementDialog from './increment-dialog'
import RelockDialog from './relock-dialog'
import SplitLockDialog from './split-lock-dialog'
import TransferOwnershipDialog from './transfer-ownership-dialog'

import SETTINGS from '@/store/settings'
// import Utils from '@/web3/utils'

export default {
  props: {
    uniPair: String
  },

  components: {
    DepositRow,
    WithdrawDialog,
    MigrateDialog,
    RelockDialog,
    TransferOwnershipDialog,
    IncrementDialog,
    SplitLockDialog
  },

  data: () => ({
    loading: true,
    locks: [], // {'lockID': 1},{'lockID': 2}
    tokenInfo: {}
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
  },

  watch: {
    sClientWatcher () {
      this.loadUserLocks(true)
    },
  },

  methods: {
    async getLocks () {
      await this.getTokenInfo()

      console.log("GET LOCKS")
      const msg1 = {
        "get_user_num_locks_for_token": {
          "user": this.sClient.address,
          "lptoken": this.uniPair,
        },
      }
      
      console.log("MSG 1 = ", msg1)
      console.log("R_Client = ", this.sClient.client)
      const CONTRACT_ADDRESS = SETTINGS.CHAINS[this.reqNetwork].lpLocker
      console.log("Contract Address = ", CONTRACT_ADDRESS)
      try {
        var numTokens = await this.sClient.client.queryContractSmart(CONTRACT_ADDRESS, msg1)

        console.log("Number of tokens = ", numTokens)
        var locks = []
        for (var i = 0; i < numTokens; i++) {
          const msg2 = {
            "get_user_lock_for_token_at_index": {
              "user": this.sClient.address,
              "lptoken": this.uniPair,
              "index": i,
            }
          }
          var token = await this.sClient.client.queryContractSmart(CONTRACT_ADDRESS, msg2)
          token = {
            ...token,
            "user_lock_index": i
          }
          console.log("TOKEN", token)
          locks.push(token)
        }
        locks.sort((a,b) => a.unlock_date - b.unlock_date)
        this.locks = locks
      } catch (err) {
        console.log(err)
      }

      console.log("Locks = ", locks)
    },
    async getTokenInfo () {
      console.log("GET TOKEN INFO")
      const tokenInfoQuery = { token_info: {} }
      console.log("uniPair = ", this.uniPair)
      const tokenInfo = await this.sClient.client.queryContractSmart(this.uniPair, tokenInfoQuery)
      console.log("Token Info = ", tokenInfo)
      this.tokenInfo = tokenInfo
    },
    withdraw (item) {
      this.$refs.withdrawDialog.open(item, this.uniPair)
    },
    transferOwnership (item) {
      this.$refs.transferOwnershipDialog.open(item, this.uniPair)
    },
    relock (item) {
      this.$refs.relockDialog.open(item, this.uniPair)
    },
    migrate (item) {
      this.$refs.migrateDialog.open(item, this.uniPair)
    },
    increment (item) {
      this.$refs.incrementDialog.open(item, this.uniPair)
    },
    split (item) {
      this.$refs.splitLockDialog.open(item, this.uniPair)
    },
    loadUserLocks (setLoading) {
      if (setLoading) {
        this.loading = true
      }
      this.getLocks()
        .then(() => {
        })
        .catch(e => {})
        .then(() => {
          this.loading = false
        })
    }
  },

  created () {
    this.loadUserLocks(true)
  }
}
</script>