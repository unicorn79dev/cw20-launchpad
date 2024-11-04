<template>

  <div>

    <div class="pa-4 border-b">
      <div class="d-flex align-center">

        <coin-icon :address="tokenHydrated.address" class="mr-3"></coin-icon>

        <div>
          {{ tokenHydrated.symbol }} Token locks
        </div>

        <v-spacer></v-spacer>
        <v-btn @click="refresh" icon>
          <v-icon color="textFaint" small>mdi-refresh</v-icon>
        </v-btn>

      </div>

      <div v-if="false">
        <div>
          <copy-address :address="tokenHydrated.address" color="textFaint"></copy-address>
        </div>
        <div class="d-flex caption textFaint--text">
          Your Balance: {{ userBalanceHuman }}
          <v-spacer></v-spacer>
          Contract Balance: {{ contractBalanceHuman }}
        </div>
        <div class="textFaint--text caption font-italic">
          Shares: {{ totalShares }}
        </div>
      </div>

    </div>

    <!-- MAIN AREA -->
    <div v-if="firstLoad" class="text-center py-4">
      <v-progress-circular
      indeterminate
      size="60"
      width="2"
      color="#aaa">
        <img 
        src="@/assets/img/APEX.png" 
        height="40px"
        class="greyscale"
        width="40px">
      </v-progress-circular>
    </div>
    <v-expand-transition>
      <div v-if="!firstLoad">
        <div v-if="locks.length === 0" class="pa-8 text-center">
          <img 
          src="@/assets/img/flags/exclamation.svg" 
          height="26px"
          class="mr-2"
          width="26px">
          <div>
            No Token Locks for this token
          </div>
          <div class="textFaint--text caption">
             on Unicrypt
          </div>
        </div>
        <div v-else>
          <!-- CHART BLOCK -->
          <div class="border-b py-3 background blocks-green white--text cursor-pointer" @click="expandLocks = !expandLocks">
            <div class="text-center mt-2">
              <div style="width: 50%;" class="mx-auto">
                <v-progress-circular
                :value="totalLockedAsPercentOfTotal"
                :rotate="-90"
                size="60"
                width="4"
                color="white">
                  <v-icon size="35" color="white">mdi-lock-outline</v-icon>
                </v-progress-circular>
                <div class="text-center px-4">
                  {{ totalLockedHuman }} {{ tokenHydrated.symbol }} Locked
                </div>
              </div>
              <div class="caption text-center white--text">
                <span class="font-weight-bold">
                  {{ totalLockedAsPercentOfTotal }}%
                </span>
                locked of total supply
              </div>
              <v-btn rounded text small color="white" @click.stop="expandLocks = !expandLocks">
                Show locks
                <v-icon small :class="[{'rotate-180': expandLocks}]">mdi-chevron-down</v-icon>
              </v-btn>
            </div>
          </div>
          <!-- CHART BLOCK -->
          <v-expand-transition>
            <div v-if="expandLocks">
              <!-- <div class="pa-2 d-flex align-center textFaint--text pl-10">
                {{ filteredLocks.length }} locks
                <v-spacer></v-spacer>

                <v-menu
                offset-y
                transition="scale-transition"
                :close-on-content-click="false"
                >
                  <template v-slot:activator="{ attrs, on }">
                    <v-btn
                      small
                      rounded outlined color="" class=""
                      v-bind="attrs"
                      v-on="on"
                    >
                      <div class="mr-1 textFaint--text">
                        Filter

                        <v-icon class="" color="textFaint" v-if="filters.showLocked" size="14">mdi-lock</v-icon>
                        <v-icon class="" color="textFaint" v-if="filters.showUnlocked" size="14">mdi-lock-open-outline</v-icon>
                        <v-icon class="" color="textFaint" v-if="filters.showWithdrawn" size="14">mdi-check-circle-outline</v-icon>

                      </div>
                      <div v-if="filters.sort === 'liquidity'">
                        liquidity
                      </div>
                      <div v-if="filters.sort === 'uniswap_index'">
                        latest
                      </div>
                      <div v-if="filters.sort === 'most_recent_lock'">
                        new lock
                      </div>
                      <div v-else-if="filters.sort === 'lock_value'">
                        value
                      </div>
                      <v-icon small color="textFaint" :class="[{'rotate-180': filters.sortAscending}]">mdi-chevron-down</v-icon>
                    </v-btn>
                  </template>

                  <v-list style="min-width: 200px;" class="pa-0 foreground">
                    <div class="pa-4 background caption font-italic">
                      Show
                    </div>
                    <v-list-item @click="filters.showLocked = !filters.showLocked">
                      <v-list-item-title>
                        Locked
                      </v-list-item-title>
                      <v-list-item-action>
                        <v-checkbox :input-value="filters.showLocked"></v-checkbox>
                      </v-list-item-action>
                    </v-list-item>
                    <v-list-item @click="filters.showUnlocked = !filters.showUnlocked">
                      <v-list-item-title>
                        Unlocked
                      </v-list-item-title>
                      <v-list-item-action>
                        <v-checkbox :input-value="filters.showUnlocked"></v-checkbox>
                      </v-list-item-action>
                    </v-list-item>
                    <v-list-item @click="filters.showWithdrawn = !filters.showWithdrawn">
                      <v-list-item-title>
                        Withdrawn
                      </v-list-item-title>
                      <v-list-item-action>
                        <v-checkbox :input-value="filters.showWithdrawn"></v-checkbox>
                      </v-list-item-action>
                    </v-list-item>
                    <div class="pa-4 background caption font-italic">
                      Sort
                    </div>
                    <v-list-item @click="sortList('value')">
                      <v-list-item-title>
                        Amount
                      </v-list-item-title>
                      <v-icon v-if="filters.sort === 'value'" color="primary" :class="['ml-1', {'rotate-180': filters.sortAscending}]">mdi-chevron-down</v-icon>
                    </v-list-item>
                    <v-list-item @click="sortList('latest')">
                      <v-list-item-title>
                        Newest Lock
                      </v-list-item-title>
                      <v-icon v-if="filters.sort === 'latest'" color="primary" :class="['ml-1', {'rotate-180': filters.sortAscending}]">mdi-chevron-down</v-icon>
                    </v-list-item>
                    <v-list-item @click="sortList('unlock_date')">
                      <v-list-item-title>
                        Unlock Date
                      </v-list-item-title>
                      <v-icon v-if="filters.sort === 'unlock_date'" color="primary" :class="['ml-1', {'rotate-180': filters.sortAscending}]">mdi-chevron-down</v-icon>
                    </v-list-item>
                  </v-list>
                </v-menu>

              </div> -->

              <div v-if="filteredLocks.length > 0">
                <v-row dense class="background border-b caption font-weight-medium textFaint--text">
                  <v-col class="ml-10">
                    Amount
                  </v-col>
                  <v-col class="text-end mr-10">
                    Unlock Date
                  </v-col>
                </v-row>

                <user-row 
                v-for="lock in paginatedLocks" 
                :key="lock.lock_id"
                :item="lock"
                :tokenHydrated="tokenHydrated"
                @withdraw="withdraw" 
                @migrate="migrate" 
                @relock="relock" 
                @transfer-ownership="transferOwnership" 
                @increment="increment" 
                @split="split"
                @revoke="revoke">
                </user-row>

                <div v-if="pageCount > 1" class="d-flex align-center justify-center background pa-2">
                  <v-btn @click="goPrevious" text :disabled="page === 0">
                    <v-icon>mdi-chevron-left</v-icon>
                  </v-btn>
                  {{ page + 1 }} / {{ pageCount }}
                  <v-btn @click="goNext" text :disabled="!nextPageExists">
                    <v-icon>mdi-chevron-right</v-icon>
                  </v-btn>
                </div>
              </div>

              <div v-else class="text-center pa-4 textFaint--text background">
                No locks for your filters
              </div>
            </div>
          </v-expand-transition>

        </div>
      </div>
    </v-expand-transition>
    <!-- END MAIN AREA -->

    <withdraw-dialog ref="withdrawDialog"></withdraw-dialog>
    <relock-dialog ref="relockDialog"></relock-dialog>
    <transfer-ownership-dialog ref="transferOwnershipDialog"></transfer-ownership-dialog>
    <migrate-dialog ref="migrateDialog"></migrate-dialog>
    <increment-dialog ref="incrementDialog"></increment-dialog>
    <split-lock-dialog ref="splitLockDialog"></split-lock-dialog>
    <revoke-dialog ref="revokeDialog"></revoke-dialog>

  </div>
    
</template>

<script>
import UserRow from '../user/user-row'
import WithdrawDialog from '../user/dialogs/withdraw-dialog'
import MigrateDialog from '../user/dialogs/migrate-dialog'
import IncrementDialog from '../user/dialogs/increment-dialog'
import RelockDialog from '../user/dialogs/relock-dialog'
import SplitLockDialog from '../user/dialogs/split-lock-dialog'
import TransferOwnershipDialog from '../user/dialogs/transfer-ownership-dialog'
import RevokeDialog from '../user/dialogs/revoke-dialog'
// import moment from 'moment'
import SETTINGS from '@/store/settings'
import Utils from '@/web3/utils'

export default {
  components: {
    UserRow,
    WithdrawDialog,
    MigrateDialog,
    RelockDialog,
    TransferOwnershipDialog,
    IncrementDialog,
    SplitLockDialog,
    RevokeDialog
  },

  props: {
    tokenHydrated: {
      type: Object,
      default: () => ({
        symbol: '',
        name: '',
        decimals: '0'
      })
    },
    isForUser: {
      type: Boolean,
      default: false
    }
  },

  data: () => ({
    numLocks: '0',
    locks: [],
    page: 0,
    rowsPerPage: 10,
    userBalance: '0',
    contractBalance: '0',
    totalShares: '0',
    filters: {
      sort: 'value',
      sortAscending: false,
      showLocked: true,
      showUnlocked: false,
      showWithdrawn: false,

    },
    firstLoad: true,
    expandLocks: false
  }),

  computed: {
    sClient () {
      return this.$store.state.signer
    },
    nextPageExists () {
      return (this.page + 1) * this.rowsPerPage < this.filteredLocks.length
    },
    pageCount () {
      var count = Math.ceil(this.filteredLocks.length / this.rowsPerPage)
      return count === 0 ? 1 : count
    },
    totalLocked () {
      // var now = moment().unix()

      var locks = this.locks;
      // var locks = this.locks.filter(item => {
      //   if (item.end_emission > now && item.shares_withdrawn !== item.shares_deposited) {
      //     return item
      //   }
      // })

      var amount = locks.reduce((a, item) => {
        return a + Number(item.tokens_deposited) - Number(item.tokens_withdrawn)
      }, 0)
      
      return amount
    },
    totalLockedAsPercentOfTotal () {
      console.log("total locked...", this.totalLocked)
      console.log("total supply...", this.tokenHydrated.total_supply)
      var amount = (this.totalLocked * 10000 / this.tokenHydrated.total_supply).toString()
      return Number(amount) / 100
    },
    totalLockedHuman () {
      return this.$root.formatAmount(this.totalLocked, this.tokenHydrated.decimals)
    },
    filteredLocks () {
      // var now = moment().unix()
      return this.locks
      // return this.locks.filter(item => {
      //   if (this.filters.showWithdrawn && item.shares_deposited === item.shares_withdrawn) {
      //     return item
      //   }
      //   if (this.filters.showUnlocked && item.end_emission < now && item.shares_withdrawn !== item.shares_deposited) {
      //     return item
      //   }
      //   if (this.filters.showLocked && item.end_emission > now && item.shares_withdrawn !== item.shares_deposited) {
      //     return item
      //   }
      // })
    },
    sortedLocks () {
      console.log("locks = ", this.locks)
      return this.locks
      // var duplicate = JSON.parse(JSON.stringify(this.filteredLocks))
      // duplicate.sort((a, b) => {
      //   if (this.filters.sort === 'value') {
      //     var aAmount = a.tokens_deposited - a.tokens_withdrawn
      //     var bAmount = b.tokens_deposited - b.tokens_withdrawn
      //     if (aAmount.gt(bAmount)) {
      //       return this.filters.sortAscending ? 1 : -1
      //     }
      //     if (bAmount.gt(aAmount)) {
      //       return this.filters.sortAscending ? -1 : 1
      //     }
      //     return 0
      //   } else if (this.filters.sort === 'latest') {
      //     return this.filters.sortAscending ? a.lock_id - b.lock_id : b.lock_id - a.lock_id
      //   } else if (this.filters.sort === 'unlock_date') {
      //     return this.filters.sortAscending ? b.end_emission - a.end_emission : a.end_emission - b.end_emission
      //   }
      // })
      // return duplicate
    },
    paginatedLocks () {
      var offset = this.page * this.rowsPerPage
      console.log("paginated...", offset)
      return this.sortedLocks.slice(offset, offset + this.rowsPerPage)
    },
    userBalanceHuman () {
      var amount = Utils.convertMicroDenomToDenom(this.userBalance, this.tokenHydrated.decimals)
      return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: this.tokenHydrated.decimals})
    },
    contractBalanceHuman () {
      var amount = Utils.convertMicroDenomToDenom(this.contractBalance, this.tokenHydrated.decimals)
      return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: this.tokenHydrated.decimals})
    }
  },

  watch: {
    tokenHydrated () {
      this.page = 0
      this.refresh()
    },
    filters: {
      deep: true,
      handler () {
        this.page = 0
      }
    }
  },

  methods: {
    goNext () {
      this.page++
    },
    goPrevious () {
      this.page--
    },
    sortList (sorting) {
      if (this.filters.sort === sorting) {
        this.filters.sortAscending = !this.filters.sortAscending
      } else {
        this.filters.sort = sorting
        this.filters.sortAscending = false
      }
    },
    async getTotalShares () {
      // var shares = await VestingContract.getTotalShares(this.tokenHydrated.address)
      this.totalShares = 1
    },

    async getLocksForTokenLength () {
      const msg = {
        "get_token_locks_length": {
          "token": this.tokenHydrated.address,
        },
      }
      
      const CONTRACT_ADDRESS = SETTINGS.CHAINS[this.$store.state.requiredNetwork].tokenLocker
      try {
        var numLocks = await this.sClient.client.queryContractSmart(CONTRACT_ADDRESS, msg)
        this.numLocks = numLocks
        console.log('numLocks = ', numLocks)
      } catch (err) {
        console.log(err)
      }
    },
    async fetchAllLocks () {
      // await this.getLocksForTokenLength()
      if (!this.tokenHydrated.address) {
        return
      }

      console.log('isForUser=', this.isForUser)
      var rows = []

      const CONTRACT_ADDRESS = SETTINGS.CHAINS[this.$store.state.requiredNetwork].tokenLocker

      var msg;
      if (!this.isForUser) {
        console.log('for token...')
        msg = {
          "get_token_locks": {
            "token": this.tokenHydrated.address,
          },
        }
      } else {
        console.log('for user...')
        msg = {
          "get_user_locks": {
            "user": this.sClient.address,
            "token": this.tokenHydrated.address,
          },
        }
      }

      console.log('msg', msg)

      var locks = await this.sClient.client.queryContractSmart(CONTRACT_ADDRESS, msg)

      for (let i = 0; i < locks.length; i++) {
        const msg_ = {
          "get_lock": {
            "lockid": locks[i],
          },
        }
        var tokenLock = await this.sClient.client.queryContractSmart(CONTRACT_ADDRESS, msg_)
        var token_lock = {
          "lock_id": tokenLock[0],
          "token_address": tokenLock[1],
          "tokens_deposited": tokenLock[2],
          "tokens_withdrawn": tokenLock[3],
          "shares_deposited": tokenLock[4],
          "shares_withdrawn": tokenLock[5],
          "start_emission": tokenLock[6],
          "end_emission": tokenLock[7],
          "owner": tokenLock[8],
        }
        rows.push(token_lock)
      }
        
      this.locks = rows
      this.firstLoad = false
    },

    /* loadToken (tokenHydrated) {
      this.tokenHydrated = tokenHydrated
      this.refresh()
    }, */
    async refresh () {
      console.log(this.tokenHydrated)
      this.getTotalShares()
      this.fetchAllLocks()
      this.getUserBalance()
      this.getContractBalance()
    },
    async getUserBalance () {
      if (!this.sClient.address) {
        return
      }
      var balance = 0
      this.userBalance = balance
    },
    async getContractBalance () {
      var balance = 0
      this.contractBalance = balance
    },
    withdraw (item) {
      this.$refs.withdrawDialog.open(item, this.tokenHydrated)
        .then(() => {
          this.refresh()
        })
        .catch(() => {})
    },
    transferOwnership (item) {
      this.$refs.transferOwnershipDialog.open(item)
    },
    relock (item) {
      this.$refs.relockDialog.open(item)
    },
    migrate (item) {
      this.$refs.migrateDialog.open(item, this.tokenHydrated)
    },
    increment (item) {
      this.$refs.incrementDialog.open(item, this.tokenHydrated)
    },
    split (item) {
      this.$refs.splitLockDialog.open(item, this.tokenHydrated)
    },
    revoke (item) {
      this.$refs.revokeDialog.open(item, this.tokenHydrated)
    },
  },

  created () {
    this.refresh()
    console.log("global token")
  }
}
</script>