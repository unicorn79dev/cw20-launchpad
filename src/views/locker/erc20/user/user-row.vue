<template>
  <div v-if="amountRemaining !== '0' && epochHasPassed == false" class="border-b">

    <!-- PAIRS ROW -->
    <div :class="['d-flex py-2 px-2 c-list align-center']" @click="expandInfo = !expandInfo">
      
      <v-icon v-if="amountRemaining === '0'" color="textFaint" size="24">mdi-check-circle-outline</v-icon>
      <v-icon v-else-if="epochHasPassed" color="textFaint" size="24">mdi-lock-open-outline</v-icon>
      <v-icon v-else color="primary" size="24">mdi-lock</v-icon>

      <div style="overflow: hidden;" class="ml-2 pr-2">

        <div v-if="amountRemaining === '0'" :class="['d-flex textFaint--text']">
          <span class="text-truncate mr-1">{{ tokensDepositedHuman }}</span> {{ tokenHydrated.symbol }}
        </div>
        <div v-else :class="['d-flex']">
          <span class="text-truncate mr-1">{{ amountRemainHuman }}</span> {{ tokenHydrated.symbol }}
        </div>
        
      </div>
      <v-spacer></v-spacer>
      <div class="text-end">
        <!-- LOCK TYPE 1 -->
        <template v-if="lockType == 1">
          <div v-if="epochHasPassed" class="font-weight-medium textFaint--text caption">
            {{ endEmissionFromNow }}
          </div>
          <div v-else class="font-weight-medium caption">
            {{ endEmissionFromNow }}
          </div>
        </template>
        <!-- LOCK TYPE 2 -->
        <template v-else-if="lockType == 2">
          <span :class="['d-inline-flex primary--text align-center caption ml-1 br-20']">
            Linear lock
            <v-icon small color="primary" class="ml-1">mdi-chart-line</v-icon>
          </span>
          <div class="font-weight-medium caption">
            {{ endEmissionFromNow }}
          </div>
        </template>

        <div class="d-flex justify-end">
          <v-progress-linear v-if="!epochHasPassed" striped reverse rounded height="4" :value="unlockProgress" :color="unlockProgress >= 20 ? 'primary' : 'primary'" background-color="outline" style="width: 100px;"></v-progress-linear>
        </div>

      </div>

      <div class="d-flex flex-column align-center justify-center">

        <v-menu
        v-if="sClient.address && !disableDialogs"
        offset-y
        left
        >
          <template v-slot:activator="{ attrs, on }">
            <v-btn
              icon
              small
              :color="sClient.address === item.owner ? 'primary' : 'textFaint'"
              v-bind="attrs"
              v-on="on"
            >

              <v-icon small color="">mdi-settings-outline</v-icon>
            </v-btn>
          </template>

          <v-list style="min-width: 200px;" class="background">
            <v-list-item v-if="sClient.address === item.owner" @click="$emit('withdraw', item)">
              <v-list-item-title>
                Withdraw
              </v-list-item-title>
              <v-icon class="ml-1" color="">mdi-arrow-up</v-icon>
            </v-list-item>
            <v-list-item v-if="sClient.address === item.owner" @click="$emit('relock', item)">
              <v-list-item-title>
                Relock
              </v-list-item-title>
              <v-icon class="ml-1" color="">mdi-update</v-icon>
            </v-list-item>
            <v-list-item v-if="sClient.address === item.owner" @click="$emit('transfer-ownership', item)">
              <v-list-item-title>
                Transfer ownership
              </v-list-item-title>
              <v-icon class="ml-1" color="">mdi-account-outline</v-icon>
            </v-list-item>
            
            <v-list-item @click="$emit('increment', item)">
              <v-list-item-title>
                Lock More Tokens
              </v-list-item-title>
              <v-icon class="ml-1" color="">mdi-plus</v-icon>
            </v-list-item>

          </v-list>
        </v-menu>

        <v-icon style="display: block;" small color="textFaint" :class="[{'rotate-180': expandInfo}]">mdi-chevron-down</v-icon>

      </div>

    </div>

    <v-expand-transition>
      <div v-if="expandInfo" class="background">

        <div>
          <div class="pa-3">
            <div class="caption textFaint--text font-italic">
              Lock id: {{ item.lock_id }}
            </div>
            <div class="caption textFaint--text">
              Owner: {{ unlockerAddressCondensed }}
            </div>
          </div>
        </div>

        <div v-if="lockType === 2" class="pa-3">
          <v-row>
            <v-col cols="6">
              <div class="font-weight-bold caption">
                <span class="caption">Start emission</span> {{ startEmissionFromNow }}
              </div>
              <div class="caption textFaint--text">
                {{ startEmissionHuman }}
              </div>
            </v-col>
            <v-col cols="6" class="text-end">
              <div class="font-weight-bold caption">
                <span class="caption">End emission</span> {{ endEmissionFromNow }}
              </div>
              <div class="caption textFaint--text">
                {{ endEmissionHuman }}
              </div>
            </v-col>
          </v-row>
          <linear-lock-chart :lock="chartItem" :tokenHydrated="tokenHydrated"></linear-lock-chart>
        </div>

      </div>
    </v-expand-transition>

  </div>
</template>

<script>
import moment from 'moment'
import LinearLockChart from '@/views/locker/erc20/charts/linear-lock'

export default {
  props: {
    item: {
      type: Object,
      default: () => {

      }
    },
    tokenHydrated: {
      type: Object,
      default: () => ({
        symbol: '',
        name: '',
        decimals: '0'
      })
    },
    disableDialogs: {
      type: Boolean,
      default: false
    },
    network: {
      type: String,
      default: null
    }
  },

  components: {
    LinearLockChart
  },

  data: () => ({
    expandInfo: false
  }),

  computed: {
    cNetwork () {
      return this.network ? this.network : this.$store.state.requiredNetwork
    },
    sClient () {
      return this.$store.state.signer
    },
    // map item to the same struct as used in lock creation for charting
    chartItem () {
      return {
        amount: this.item.tokens_deposited,
        start_emission: this.item.start_emission,
        end_emission: this.item.end_emission
      }
    },
    unlockerAddressCondensed () {
      var address = this.item.owner
      if (!address) {
        return ''
      }
      return address.slice(0, 6) + '...' + address.slice(address.length - 4)
    },
    unlockProgress () {
      var now = moment().unix()
      // return ((this.item.end_emission - now) * 100) / 31536000 // 1 year
      return ((this.item.end_emission - now) * 100) / 10368000 // 4 months
    },
    lockType () {
      return this.item.start_emission === 0 ? 1 : 2
    },
    lockColor () {
      if (this.amountRemaining === '0') {
        return 'textFaint'
      } else if (this.epochHasPassed) {
        return 'orange'
      }
      return 'primary'
    },
    lockColorText () {
      if (this.amountRemaining === '0') {
        return 'textFaint--text'
      } else if (this.epochHasPassed) {
        return 'orange--text'
      }
      return 'primary--text'
    },
    dollarValue () {
      return 0
    },
    epochHasPassed () {
      return this.item.end_emission < moment().unix()
      // return true // for testing withdrawl before unlock
    },
    endEmissionFromNow () {
      if (moment.unix(this.item.end_emission).isValid()) {
        return moment.unix(this.item.end_emission).fromNow()
      }
      return ''
    },
    endEmissionHuman () {
      if (moment.unix(this.item.end_emission).isValid()) {
        return moment.unix(this.item.end_emission).format('D MMMM YYYY, HH:mm')
      }
      return ''
    },
    startEmissionFromNow () {
      if (moment.unix(this.item.start_emission).isValid()) {
        return moment.unix(this.item.start_emission).fromNow()
      }
      return ''
    },
    startEmissionHuman () {
      if (moment.unix(this.item.start_emission).isValid()) {
        return moment.unix(this.item.start_emission).format('D MMMM YYYY, HH:mm')
      }
      return ''
    },
    amountRemaining () {
      return (this.item.tokens_deposited - this.item.tokens_withdrawn).toString()
    },
    amountRemainHuman () {
      console.log("amount remaining...", this.amountRemaining)
      return this.$root.formatAmount(this.amountRemaining, this.tokenHydrated.decimals)
    },
    sharesWithdrawnHuman () {
      return this.$root.formatAmount(this.item.shares_withdrawn, this.tokenHydrated.decimals)
    },
    sharesDepositedHuman () {
      return this.$root.formatAmount(this.item.shares_deposited, this.tokenHydrated.decimals)
    },
    tokensDepositedHuman () {
      return this.$root.formatAmount(this.item.tokens_deposited, this.tokenHydrated.decimals)
    },
    tokensWithdrawnHuman () {
      return this.$root.formatAmount(this.item.tokens_withdrawn, this.tokenHydrated.decimals)
    },
  },

  methods: {
  },

  created () {
    // if (this.customCondition) {
    //   this.getConditionStatus()
    // }
  }
}
</script>