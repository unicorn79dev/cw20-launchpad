<template>
  <v-container style="max-width: 600px;">

    <v-card :class="['br-20 mb-16', {'pa-4': $vuetify.breakpoint.xs}, {'pa-6': !$vuetify.breakpoint.xs}]">
      
      <div class="d-flex align-center">
        <v-btn icon :to="`/browser/pairs`" color="text">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </div>

      <!-- <div class="text-center">
        <copy-address :address="pair.address" color="textFaint"></copy-address>
      </div> -->

      <div class="mt-4 mb-6 text-center">
        <v-btn text color="textFaint" rounded :href="`${''}`" target="_blank">
          {{ address }}
          <v-icon x-small>mdi-arrow-top-right</v-icon>
        </v-btn>
      </div>

      <div :class="['']">

        <template>
          
          <!-- LOCKED -->
          <!-- <div v-if="items.length > 0">
            <div class="mb-2 font-weight-medium midground pa-4 br-20" style="position: relative; overflow: hidden;">
              <div class="purple" style="position: absolute; left: 0px; top: 0px; bottom: 0px; right: 0px;opacity: 0.2;">
              </div>
              <div>
                <div class="ma-1 d-flex align-center">
                  <v-progress-circular
                  :value="percentOfTotal"
                  :rotate="-90"
                  size="50"
                  width="3"
                  color="purple">
                    <v-icon size="30" color="purple">mdi-lock-outline</v-icon>
                  </v-progress-circular>
                  
                  <div class="ml-4">

                    <div class="title text--text">
                      <span class="text--text">{{ percentOfTotal }}%</span> LOCKED
                    </div>
                    <div class="d-flex">
                      <div class="purple--text">
                        ${{ lockedValueHuman }}
                      </div>
                      <div class="textFaint--text ml-1">
                        / ${{ reserveValueHuman }}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div> -->

          <!-- <div class="d-flex mt-8">
            Total LP tokens
            <v-spacer></v-spacer>
            {{ totalSupplyHuman }}
          </div>
          <div class="d-flex">
            Total locked LP
            <v-spacer></v-spacer>
            {{ totalLockedHuman }}
          </div> -->

          <template v-if="items.length > 0">
            <div class="d-flex mt-4 textFaint--text font-italic">
              <div>
                Locked amount
              </div>
              <v-spacer></v-spacer>
              <div class="mr-9">
                Unlock date
              </div>
            </div>

            <div>
              <unlock-row v-for="(item, index) of items" :item="item" :key="index" :reserveUSD="reserveUSD" :totalSupply="totalSupply"></unlock-row>
            </div>
          </template>

        </template>
      </div>

    </v-card>
    
  </v-container>
</template>

<script>
import _ from 'lodash'
import UnlockRow from './unlock-row'
import SETTINGS from '@/store/settings'
// import moment from 'moment'

export default {
  components: {
    UnlockRow,
  },

  props: {
    address: {
      type: String
    }
  },

  data: () => ({
    pair: {
      token0: {},
      token1: {}
    },
    totalLockedTokens: '0', // with unlock epoch above now
    items: [],
    totalSupply: '0',
    reserveUSD: '0',
    loadingLockedLiquidity: true,
    loadingPOL1: true,
    POL1Length: 0,
    POL1SyncIndex: 0,
    uniswapAPIIsDown: false
  }),

  computed: {
    sClient () {
      return this.$store.state.signer
    },
    totalSupplyHuman () {
      return 0
      // var amount = ethers.utils.formatUnits(this.totalSupply, 18)
      // return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 4})
    },
    totalLockedHuman () {
      return 0
      // var amount = ethers.utils.formatUnits(this.totalLockedTokens, 18)
      // return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 4})
    },
    percentOfTotal () {
      return 0
      // if (this.totalSupply === '0') {
      //   return '0'
      // }
      // var percent = ethers.BigNumber.from(this.totalLockedTokens).mul(1000).div(this.totalSupply)
      // return percent.toNumber() / 10
    },
    reserveValueHuman () {
      return 0
      // var value = this.reserveUSD
      // return Number(value).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})
    },
    lockedValueHuman () {
      return 0
      // if (this.totalSupply === '0') {
      //   return '0'
      // }
      // var percent = ethers.BigNumber.from(this.totalLockedTokens).mul(10000000000).div(this.totalSupply)
      // var value = this.reserveUSD * percent / 10000000000
      // return Number(value).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})
    },
    POL1Progress () {
      return 0
      // if (this.POL1Length === 0) {
      //   return 0
      // }
      // var progress = (this.POL1SyncIndex / this.POL1Length) * 100
      // return progress
    },
    token0Symbol () {
      return 'xxx'
      // if (this.pair.token0.address === '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2') {
      //   return 'ETH'
      // }
      // return this.pair.token0.symbol
    },
    token1Symbol () {
      return 'yyy'
      // if (this.pair.token1.address === '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2') {
      //   return 'ETH'
      // }
      // return this.pair.token1.symbol
    },
  },

  methods: {
    loadAPI: _.debounce(function () {
      console.log("loading api...")
      return new Promise((resolve, reject) => {
        // this.$axios.get(`/uniswap/pair/${this.address}?network=${this.$store.state.ethers.network}`)
        //   .then(response => {
        //     this.pair = response.data
        //   })
        //   .then(() => resolve())
        //   .catch(error => {
        //     console.log(error)
        //     reject(error)
        //   })
      })
    }, 500, {leading: true}),

    async loadLocks () {
      console.log("load locks...")
      const CONTRACT_ADDRESS = SETTINGS.CHAINS[this.$store.state.requiredNetwork].lpLocker

      const msg_ = {
        "get_lock_for_token": {
          "lptoken": this.address,
        }
      }
          
      var tokenLock = await this.sClient.client.queryContractSmart(CONTRACT_ADDRESS, msg_)
      console.log("TokenLock = ", tokenLock)
      
      this.items = tokenLock
    },

    async getUniswapTotalSupply () {
    },

    getReserveUSD () {
    },

    async doFirstLoad () {
      await this.getUniswapTotalSupply() // this needs to be called before loadLocks
      this.loadLocks()
        .then(() => {})
        .catch(e => {
          console.log(e)
        })
        .then(() => {
          this.loadingLockedLiquidity = false
        })
    }
  },

  created () {
    this.loadAPI()
    this.doFirstLoad()
  }
}
</script>