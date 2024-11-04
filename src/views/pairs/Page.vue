<template>
  <v-container style="max-width: 600px;" :class="[{'pa-0 foreground': $vuetify.breakpoint.xs}]">

    <div :class="['mb-16', {'': $vuetify.breakpoint.xs}, {'v-card br-20': !$vuetify.breakpoint.xs}]">
      
      <div class="pt-5 pb-3 pl-2 pr-2">

        <div class="mb-5 d-flex align-center inputcolor pa-3 r-outlined br-20">
          <c-input :value.sync="filters.search" placeholder="Pair address...">
          </c-input>

          <v-progress-circular
          v-if="showSearchLoader"
          indeterminate
          width="2"
          class="mr-2"
          size="24"
          color="primary"
          ></v-progress-circular>

          <v-icon v-if="filters.search === ''">
            mdi-magnify
          </v-icon>
          <v-icon v-else @click="filters.search = ''">
            mdi-close
          </v-icon>
        </div>

        <div class="d-flex align-center pl-2">

          <v-spacer></v-spacer>
        </div>

      </div>

      <div>
        <!-- PAGINATION -->
        <div v-if="pageCount > 1" class="d-flex align-center my-1 justify-end mr-2">
          <v-btn :disabled="page === 0" @click="firstPage" text icon color="text">
            <v-icon small>mdi-page-first</v-icon>
          </v-btn>
          <v-btn @click="previousPage" :disabled="page <= 0" text icon color="text">
            <v-icon small>mdi-chevron-left</v-icon>
          </v-btn>
          <v-btn icon :disabled="!nextPageExists" @click="nextPage" text color="text">
            <v-icon small>mdi-chevron-right</v-icon>
          </v-btn>
          <v-btn icon :disabled="!nextPageExists" @click="lastPage" text color="text">
            <v-icon small>mdi-page-last</v-icon>
          </v-btn>
        </div>
        <!-- PAGINATION -->
      </div>

      <div v-if="firstLoad" class="text-center pa-12">
        <v-progress-circular
        indeterminate
        size="80"
        width="3"
        color="#aaa">
          <img 
          src="@/assets/img/APEX.png" 
          height="50px"
          width="50px"
          class="greyscale">
        </v-progress-circular>
      </div>

      <row
      v-for="(item, i) of items" 
      :key="item.address"
      :index="(page * filters.rowsPerPage) + i + 1"
      class="border-b"
      :item="item">
      </row>

      <div v-if="items.length === 0 && !firstLoad" class="pa-4 text-center">
        <v-icon size="100" color="textFaint">mdi-magnify</v-icon>
        <div class="textFaint--text">
          No pairs found. Your filters may be too restricting.
        </div>
      </div>

      <!-- PAGINATION -->
      <div v-if="pageCount > 1" class="d-flex align-center my-2 justify-center">
        <v-btn :disabled="page === 0" @click="firstPage" text icon color="text">
          <v-icon small>mdi-page-first</v-icon>
        </v-btn>
        <v-btn @click="previousPage" :disabled="page <= 0" text icon color="text">
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
        <div class="px-2 textFaint--text">
          {{ page + 1 }} / {{ pageCount }}
        </div>
        <v-btn icon :disabled="!nextPageExists" @click="nextPage" text color="text">
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
        <v-btn icon :disabled="!nextPageExists" @click="lastPage" text color="text">
          <v-icon small>mdi-page-last</v-icon>
        </v-btn>
      </div>
      <!-- PAGINATION -->

    </div>
    
  </v-container>
</template>

<script>
import _ from 'lodash'
import Row from '@/views/pairs/row'
import SETTINGS from '@/store/settings'

export default {
  name: 'PairsComponent',
  components: {
    Row
  },

  data: () => ({
    items: [],
    page: 0,
    filters: {
      rowsPerPage: 20,
      sort: 'lock_value',
      sortAscending: false,
      search: ''
    },
    firstLoad: true,
    loading: false,
    showSearchLoader: false,
    lock_stats: {},
    nextPageExists: false,
    uniswapPairCount: null,
    showAdvert: true,
    rowCount: 0
  }),

  computed: {
    sClient () {
      return this.$store.state.signer
    },
    reqNetwork () {
      return this.$store.state.requiredNetwork
    },
    totalLockedHuman () {
      var amount = parseInt(this.lock_stats.tval)
      if (amount >= 1000000) {
        var deci = Number(amount / 1000000).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})
        return deci + 'M'
      } else if (amount > 1000) {
        return Math.floor(amount / 1000) + 'k'
      }
      return amount
    },
    pageCount () {
      return Math.ceil(this.rowCount / this.filters.rowsPerPage)
    }
  },

  watch: {
    'filters.search' (nv) {
      this.showSearchLoader = true
      this.page = 0
      this.normalLoad()
    }
  },

  methods: {
    sortList (sorting) {
      this.showSearchLoader = true
      if (this.filters.sort === sorting) {
        this.filters.sortAscending = !this.filters.sortAscending
      } else {
        this.filters.sort = sorting
        this.filters.sortAscending = false
      }
      this.page = 0
      this.normalLoad()
    },

    nextPage () {
      if (this.page + 1 >= this.pageCount) {
        return
      }
      this.showSearchLoader = true
      this.page++
      this.normalLoad()
    },

    firstPage () {
      if (this.page === 0) {
        return
      }
      this.showSearchLoader = true
      this.page = 0
      this.normalLoad()
    },

    lastPage () {
      if (this.page === this.pageCount - 1) {
        return
      }
      this.showSearchLoader = true
      this.page = this.pageCount - 1
      this.normalLoad()
    },

    previousPage () {
      if (this.page <= 0) {
        return
      }
      this.showSearchLoader = true
      this.page--
      this.normalLoad()
    },

    normalLoad: _.debounce(async function () {
      const tokenLocks = await this.APIFetch()
      this.items = tokenLocks
      this.rowCount = tokenLocks.length
      var endOfPage = (this.page + 1) * this.filters.rowsPerPage
      this.nextPageExists = endOfPage < tokenLocks.length
    }, 300, {leading: false}),

    async APIFetch () {
      this.loading = true

      var tokenLocks = []

      try {
        const CONTRACT_ADDRESS = SETTINGS.CHAINS[this.reqNetwork].lpLocker

        const msg_locknum = {
          "get_num_locked_tokens": {},
        }
        var numTokens = await this.sClient.client.queryContractSmart(CONTRACT_ADDRESS, msg_locknum)
        console.log("NumToken = ", numTokens)
        
        for (var i = 0; i < numTokens; i++) {
          const msg = {
            "get_locked_token_at_index": {
              "index": i,
            }
          }
          var address = await this.sClient.client.queryContractSmart(CONTRACT_ADDRESS, msg)
          console.log("Address = ", address)

          tokenLocks = tokenLocks.concat({"address":address})

          // console.log("tokenLocks = ", tokenLocks)
        }
        // this.usersLockedTokens = tokens
      } catch (err) {
        console.log(err)
      }

      this.loading = false
      this.showSearchLoader = false
      this.firstLoad = false

      return tokenLocks
      // const response = {"data": {"rows": [1, 2]}, "count": 2}
      // resolve(response)
      // this.showSearchLoader = false
      // this.firstLoad = false
      // this.lock_stats = {"tval": 10, "pair-count": 5}
    },
    fetchUniswapPairCount () {
      this.uniswapPairCount = 3
      // this.$axios.get('/uniswap/pair-count')
      //   .then(response => {
      //     this.uniswapPairCount = response.data.count
      //   })
      //   .catch(error => {
      //     console.log(error)
      //   })
      //   .then(() => {
      //     // this.firstLoad = false
      //   })
    },
  },

  created () {
    this.fetchUniswapPairCount()
    this.normalLoad()
  }
}
</script>