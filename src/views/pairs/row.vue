<template>
  <div>

    <div class="c-list pa-4" @click="expandInfo = !expandInfo">
      <div class="d-flex align-center">
        {{ item.address }}
        <v-spacer></v-spacer>
        <v-icon small color="textFaint" :class="[{'rotate-180': expandInfo}]">mdi-chevron-down</v-icon>
      </div>
    </div>

    <v-expand-transition>
      <div v-if="expandInfo" class="background">
        <div class="text-center mt-1">
          <v-btn color="textFaint" rounded text :href="'https://scanlink'" target="_blank">
            Explorer
            <v-icon x-small>mdi-arrow-top-right</v-icon>
          </v-btn>
          
          <router-link :to="`/browser/pair/${item.address}`" :item="item">
            <v-btn rounded text color="textFaint">
              View lock page
            </v-btn>
          </router-link>
        </div>

      </div>
    </v-expand-transition>

  </div>
</template>

<script>
import moment from 'moment'

export default {
  props: {
    item: {},
    index: {
      type: Number,
      default: null
    },
    exchange: null
  },

  data: () => ({
    liveStats: {
      reserveUSD: '0',
      totalSupply: '0'
    },
    totalSupply: '0',
    loadReserve: true,
    loadReserveFailed: false,
    refreshReservesLoading: false,
    reserves: {
      reserve0: '0',
      reserve1: '0'
    },
    expandInfo: false
  }),

  computed: {
    dextLink () {
      return null
    },
    cNetwork () {
      return 'SEI'
    },
    cExchange () {
      return true
    },
    token0Symbol () {
      return 'XXX'
    },
    token1Symbol () {
      return 'YYY'
    },
    percentLocked () {
      return 0
    },
    dollarValueLive () {
      return 0
    },
    dollarValueLiveHuman () {
      return 0
    },
    // this is from the database, does not rely on uniswap api
    dollarValueDatabase () {
      return 0
    },
    dateFromNow () {
      if (moment.unix(this.item.next_unlock).isValid() && this.item.next_unlock !== '0') {
        return moment.unix(this.item.next_unlock).fromNow()
      }
      return null
    },
    reserveUSDHuman () {
      return 0
    },
    reserve0Human () {
      return 0
    },
    reserve1Human () {
      return 0
    },
  },

  watch: {
    'item.address' (nv) {
      // this.getLiveStats()
    }
  },

  methods: {
    openTokenPage (address) {
      this.$root.tokenPage.open(address, this.cNetwork, this.cExchange)
    },
    async getBlockchainSupply () { // get total supply from the blockchain if the the graph api is down
    },
    async getReserves () {
    },
    async getLiveStats () {
    },
  },

  created () {
  }
}
</script>