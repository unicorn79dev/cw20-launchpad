<template>
  <div>
      
    <div class="">

      <div :class="['d-flex align-center mt-5 mb-3 pa-3 r-outlined br-20 mx-2', {'inputcolor': $vuetify.breakpoint.xs}, {'inputcolor': !$vuetify.breakpoint.xs}]">
        <c-input :value.sync="filters.search" placeholder="Token address..." class="">
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
      
    </div>

    <div v-if="firstLoad" class="text-center pa-12">
      <v-progress-circular
      indeterminate
      size="80"
      width="3"
      color="#aaa">
        <img 
        src="@/assets/img/APEX.png"
        class="greyscale"
        height="50px"
        width="50px">
      </v-progress-circular>
    </div>

    <v-scroll-x-transition>
      <div v-if="!firstLoad">

        <div :class="['d-flex align-center border-b border-t', $vuetify.breakpoint.xs ? 'px-2' : 'px-2']">
          <!-- PAGINATION -->
          <v-spacer></v-spacer>
          <div class="d-flex align-center my-2 justify-center">
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

        <token-row
        v-for="(item, i) of items" 
        :key="item.address"
        :item="item"
        :index="(page * filters.rowsPerPage) + i + 1"
        >
        </token-row>

        <div v-if="items.length === 0 && !firstLoad" class="pa-4 text-center">
          <v-icon size="100" color="textFaint">mdi-magnify</v-icon>
          <div class="textFaint--text">
            No tokens found. Your filters may be too restricting.
          </div>
          <v-btn class="mt-4" @click="disableFilters" outlined rounded>
            Disable filters
          </v-btn>
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
    </v-scroll-x-transition>
    
  </div>
</template>

<script>
import _ from 'lodash'
import TokenRow from './token-row'
import SETTINGS from '@/store/settings'

export default {
  components: {
    TokenRow,
  },

  data: () => ({
    items: [],
    page: 0,
    tab: 0,
    filters: {
      rowsPerPage: 20,
      sort: 'volume24hr',
      sortAscending: false,
      minVolume: '0',
      minTX: '0',
      search: '',
      showLockedOnly: false,
      excludeStablecoins: true
    },
    loading: false,
    firstLoad: true,
    showSearchLoader: false,
    nextPageExists: false,
    uniswapTokenCount: null,
    showFilterPanel: false,
    rowCount: 0
  }),

  computed: {
    sClient () {
      return this.$store.state.signer
    },
    reqNetwork () {
      return this.$store.state.requiredNetwork
    },
    filtersActive () {
      if (this.filters.showLockedOnly !== false || this.filters.minVolume !== '0' || this.filters.excludeStablecoins !== false) {
        return true
      }
      return false
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
    },
    'filters.showLockedOnly' (nv) {
      this.page = 0
      this.normalLoad()
    },
    'filters.excludeStablecoins' (nv) {
      this.page = 0
      this.normalLoad()
    },
    filters: {
      deep: true,
      handler () {
        this.page = 0
        this.normalLoad()
      }
    }
  },

  methods: {
    disableFilters () {
      this.filters.showLockedOnly = false
      this.filters.minVolume = '0'
      this.filters.excludeStablecoins = false
    },
    onScroll (e) {
      if (typeof window === 'undefined') return
      if ((window.innerHeight + window.pageYOffset) >= document.body.scrollHeight - 10) {
        this.nextPage()
      }
    },
    sortList (sorting) {
      if (this.filters.sort === sorting) {
        this.filters.sortAscending = !this.filters.sortAscending
      } else {
        this.filters.sort = sorting
        this.filters.sortAscending = false
      }
      this.page = 0
      this.normalLoad()
    },

    normalLoad: _.debounce(async function () {
      const tokens = await this.APIFetch()
      this.items = tokens
      this.rowCount = tokens.length
      var endOfPage = (this.page + 1) * this.filters.rowsPerPage
      this.nextPageExists = endOfPage < tokens.length
    }, 500, {leading: false}),

    nextPage () {
      if (this.page + 1 >= this.pageCount) {
        return
      }
      this.page++
      this.normalLoad()
    },

    firstPage () {
      if (this.page === 0) {
        return
      }
      this.page = 0
      this.normalLoad()
    },

    lastPage () {
      if (this.page === this.pageCount - 1) {
        return
      }
      this.page = this.pageCount - 1
      this.normalLoad()
    },

    previousPage () {
      if (this.page <= 0) {
        return
      }
      this.page--
      this.normalLoad()
    },

    async APIFetch () {
      this.loading = true

      const CONTRACT_ADDRESS = SETTINGS.CHAINS[this.reqNetwork].tokenLocker
      console.log('token fetch...')
      try {
        const msg_tokens = {
          "get_tokens": {},
        }
        var tokens = await this.sClient.client.queryContractSmart(CONTRACT_ADDRESS, msg_tokens)
        console.log("tokens = ", tokens)

        // var tokens = ["sei1h8rsuk24f3h8cfgslcfxf8skl76w8xkkt08ygmwy8p6un53563zsuemez4"]

        var tokenInfos = []
        for (var i = 0; i < tokens.length; i++) {
          const tokenInfoQuery = { token_info: {} }
          var tokenInfo = await this.sClient.client.queryContractSmart(tokens[i], tokenInfoQuery)
          tokenInfo = {...tokenInfo, "address":tokens[i]}
          tokenInfos.push(tokenInfo)
        }
      } catch (err) {
        console.log(err)
      }
      this.loading = false
      this.showSearchLoader = false
      this.firstLoad = false

      console.log("token infos...", tokenInfos)
      return tokenInfos
    },

    fetchUniswapTokenCount () {
    },
  },

  created () {
    this.fetchUniswapTokenCount()
    this.normalLoad()
  }
}
</script>