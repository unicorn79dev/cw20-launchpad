<template>
  <v-container style="max-width: 600px; overflow: hidden;" :class="[{'pa-0': $vuetify.breakpoint.xs}]">

    <div :class="['mb-16', {'': $vuetify.breakpoint.xs}, {'': !$vuetify.breakpoint.xs}]">

      <div v-if="firstLoad" class="text-center">
        <v-progress-circular
        indeterminate
        size="80"
        width="2"
        color="#aaa">
          <img 
          src="@/assets/img/APEX.png" 
          height="50px"
          class="greyscale"
          width="50px">
        </v-progress-circular>
      </div>

      <v-scroll-x-transition mode="out-in">
        <div v-if="!firstLoad">

          <div :class="[{'v-card br-20 ma-2': $vuetify.breakpoint.xs}, {'v-card br-20': !$vuetify.breakpoint.xs}]">
            <div class="text-center">
              <div class="d-flex align-center border-b pa-3">
                <v-btn icon :to="`/browser/tokens`" color="textFaint">
                  <v-icon>mdi-arrow-left</v-icon>
                </v-btn>
                <coin-icon :address="address" :url="token.icon_url" :size="30" class="mr-2"></coin-icon>
                <div text class="title pa-0 font-weight-bold" style="min-width: 10px;">
                  <span>
                    {{ tokenHydrated.symbol }}
                  </span>
                </div>
                <span class="textFaint--text ml-2">{{ tokenHydrated.name }}</span>
                <!-- <v-spacer></v-spacer>
                <enmt-badge v-if="tokenHydrated.isENMT"></enmt-badge> -->
              </div>
              <div class="background py-2">
                <div>
                  <copy-address :address="address" color="text"></copy-address>
                </div>
                <div class="textFaint--text caption text-center">
                  Total Supply: {{ totalSupplyHuman }}
                </div>
              </div>
            </div>

          </div>

          <div class="d-flex align-center pt-6 pr-4">
            <v-spacer></v-spacer>
            <v-btn rounded small color="primary" 
            :to="`/token?token=${tokenHydrated.address}`"
            class="green-button">
              Lock tokens
              <v-icon small class="ml-1">mdi-lock-outline</v-icon>
            </v-btn>
          </div>

          <div :class="[{'v-card br-20 ma-2': $vuetify.breakpoint.xs}, {'mt-2 v-card br-20': !$vuetify.breakpoint.xs}]">
            <global-token :tokenHydrated="tokenHydrated" :isForUser="false"></global-token>
          </div>

        </div>
      </v-scroll-x-transition>
      
    </div>
    
  </v-container>
</template>

<script>
import _ from 'lodash'
import GlobalToken from '@/views/locker/erc20/global-token/Main'
import Utils from '@/web3/utils'

export default {
  components: {
    GlobalToken
  },

  props: {
    address: {
      type: String
    }
  },

  data: () => ({
    tab: 0,
    token: {
      total_supply: '0'
    },
    pairs: [],
    page: 0,
    filters: {
      rowsPerPage: 20,
      sort: 'lock_value',
      sortAscending: false,
    },
    nextPageExists: false,
    uniswap_chart: [],
    firstLoad: true,
    mostLiquidPair: {},
    tokenHydrated: {
      address: null
    },
  }),

  computed: {
    sClient () {
      return this.$store.state.signer
    },
    sClientWatcher () {
      return this.sClient.watcher
    },
    totalSupplyHuman () {
      var tsupply = Utils.convertMicroDenomToDenom(this.token.total_supply, this.token.decimals)
      return Number(tsupply).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})
    },
  },

  watch: {
    sClientWatcher () {
      console.log('refreshing page', this.$store.state.requiredNetwork)
      this.refresh()
    }
  },

  methods: {
    loadAPI: _.debounce(function () {
      // return new Promise((resolve, reject) => {
      //   this.$axios.get(`/erc20/token/${this.address}`)
      //     .then(response => {
      //       this.token = response.data
      //     })
      //     .then(() => resolve())
      //     .catch(error => {
      //       console.log(error)
      //       reject(error)
      //     })
      // })
    }, 500, {leading: true}),

    async loadToken () {
      try {
        const tokenInfoQuery = { token_info: {} }
        var tokenInfo = await this.sClient.client.queryContractSmart(this.address, tokenInfoQuery)
        tokenInfo = {...tokenInfo, "address": this.address}
        this.tokenHydrated = tokenInfo
        this.token = tokenInfo
      } catch (e) {}
    },
    async refresh () {
      await this.loadToken()
      this.loadAPI()
    }
  },

  created () {
    this.refresh()
      .then(() => {
        this.firstLoad = false
      })
  }
}
</script>