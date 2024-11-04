<template>
  <div class="border-b">
    <div class="c-list pa-2" @click="expandMenu = !expandMenu">
      <div class="d-flex align-center px-2">

        <div class="font-weight-medium d-flex align-center">
          {{ amountHumanWithCommas }} {{ tokenHydrated.symbol }}
          <v-icon v-if="errorMinimumLockAmount" small color="orange" class="ml-2">mdi-alert-outline</v-icon>
        </div>

        <v-spacer></v-spacer>

        <v-btn rounded text small @click.stop="expandMenu = !expandMenu" :color="expandMenu ? 'textFaint' : 'primary'">
          Edit
          <v-icon small :class="[{'rotate-180': expandMenu}]">mdi-chevron-down</v-icon>
        </v-btn>

        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              small
              v-bind="attrs"
              v-on="on"
              @click.stop="$emit('duplicate')"
            >
              <v-icon small>mdi-content-copy</v-icon>
            </v-btn>
          </template>
          <span>Duplicate</span>
        </v-tooltip>

        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              small
              v-bind="attrs"
              v-on="on"
              @click.stop="$emit('remove-lock')"
            >
              <v-icon small>mdi-close</v-icon>
            </v-btn>
          </template>
          <span>Delete</span>
        </v-tooltip>

      </div>

      <div class="d-flex align-center pb-1">
        <div v-if="!lockType1" :class="['caption ml-1 br-20 px-2 background']">
          <v-icon small color="blue">mdi-chart-line</v-icon>
          Linear lock
        </div>

        <div v-if="!lockType1" class="px-2 textFaint--text caption">
          {{ startDateHuman }} - 
          <span class="textFaint--text caption">{{ endDateHuman }}</span>
        </div>
        <div v-else class="px-2 textFaint--text caption">
          Unlocks: <strong>{{ endDateFromNow }}</strong> | 
          <span class="textFaint--text caption">{{ endDateHuman }}</span>
        </div>
      </div>

      <div class="caption d-flex align-center">
        <div :class="['ml-1 br-20 px-2 background']">
          Unlocker: 
          <span v-if="unlockerIsMe" class="primary--text">
            Me
          </span>
          <template v-else>
            <template v-if="!ownerIsValid">
              <v-icon small color="orange">mdi-alert-outline</v-icon>
            </template>
            <template v-else>
              {{ unlockerAddressCondensed }}
            </template>
          </template>
        </div>
      </div>
    </div>

    <v-expand-transition>
      <div v-show="expandMenu">
        <div class="background pa-2">
          <div class="v-card pa-4">
            <div class="mt-10 mb-2 font-weight-bold text-center">
              Who can withdraw the tokens?
            </div>

            <div class="text-center">
              <v-btn rounded depressed :color="unlockerIsMe ? 'primary--text' : 'textFaint--text'" @click="unlockerIsMe = true">
                Me
              </v-btn>
              <v-btn rounded depressed :color="!unlockerIsMe ? 'primary--text' : 'textFaint--text'" @click="unlockerIsMe = false">
                Someone else
              </v-btn>
            </div>

            <v-expand-transition>
              <div v-if="!unlockerIsMe">
                <div class="textFaint--text text-center caption py-2">
                  *Allow someone else to withdraw these tokens after the lock date.
                </div>
                <div class="mt-2 d-flex align-center pa-3 r-outlined br-8 inputcolor">
                  <c-input :value.sync="lock.owner" placeholder="Unlocker address">
                  </c-input>
                </div>
                <div v-if="ownerIsValid" class="justify-center caption primary--text d-flex align-center">
                  Valid address
                  <v-icon small color="primary" class="ml-2">mdi-check</v-icon>
                </div>
                <div v-else class="justify-center caption orange--text d-flex align-center">
                  Invalid address
                  <v-icon small color="orange" class="ml-2">mdi-alert-outline</v-icon>
                </div>
              </div>
            </v-expand-transition>
            
            <div class="mt-10 mb-2 font-weight-bold text-center">
              Lock how many tokens?
            </div>

            <div class="pa-4 align-center flex-nowrap inputcolor r-outlined">

              <div class="caption text-end pt-2">
                Balance: {{ tokenBalanceHuman }}
              </div>

              <div class="d-flex align-center">
                <c-input :value.sync="amountHuman" placeholder="0.0" @updateWhileFocussed="onHumanAmountChange" class="pa-2 font-weight-bold">

                </c-input>

                <div class="font-weight-bold">
                  {{ tokenHydrated.symbol }}
                </div>

                <v-btn small rounded depressed color="primary" @click="setMax" class="ml-2">
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

            <div v-if="errorMinimumLockAmount" class="justify-center caption orange--text d-flex align-center">
              Minimum lock amount {{ minimumLockAmount }} {{ tokenHydrated.symbol }}
              <v-icon small color="orange" class="ml-2">mdi-alert-outline</v-icon>
            </div>

            <div class="text-center mt-10">
              <v-btn rounded depressed :class="lockType1 ? 'primary--text' : 'textFaint--text'" @click="lockType1 = true">
                Unlock on date
              </v-btn>
              <v-btn rounded depressed :color="!lockType1 ? 'blue--text' : 'textFaint--text'" @click="lockType1 = false">
                Unlock over time
              </v-btn>
            </div>

            <div v-if="lockType1" class="mt-8 d-flex align-start inputcolor r-outlined pa-4">
              <div>
                <div class="font-weight-bold">
                  {{ endDateHuman }}
                </div>
                <div class="">
                  {{ endDateFromNow }} <!-- (unix {{ unlockDate }}) -->
                </div>
              </div>
              <v-spacer></v-spacer>
              <c-date @setDate="setEndEmission"></c-date>
            </div>

            <div v-if="!lockType1" class="v-card pa-2">
              <div class="mt-8 text-center textFaint--text caption">
                <div>
                <v-icon size='40' color="blue">mdi-chart-line</v-icon>
                </div>
                Allows you to withdraw tokens every block, scaled linearly over time
              </div>
              <div class="mt-8 text-center textFaint--text caption">
                Start date
              </div>
              <div class="mt-2 d-flex align-start inputcolor r-outlined pa-4">
                <div>
                  <div class="font-weight-bold">
                    {{ startDateHuman }}
                  </div>
                  <div class="">
                    {{ startDateFromNow }} <!-- (unix {{ unlockDate }}) -->
                  </div>
                </div>
                <v-spacer></v-spacer>
                <c-date @setDate="setStartEmission" color="blue"></c-date>
              </div>
              <div class="mt-8 text-center textFaint--text caption">
                End date
              </div>
              <div class="mt-2 d-flex align-start inputcolor r-outlined pa-4">
                <div>
                  <div class="font-weight-bold">
                    {{ endDateHuman }}
                  </div>
                  <div class="">
                    {{ endDateFromNow }} <!-- (unix {{ unlockDate }}) -->
                  </div>
                </div>
                <v-spacer></v-spacer>
                <c-date @setDate="setEndEmission" color="blue"></c-date>
              </div>

              <div v-if="lock.start_emission >= lock.end_emission" class="mt-2 justify-center caption orange--text d-flex align-center">
                End date must be after start date
                <v-icon small color="orange" class="ml-2">mdi-alert-outline</v-icon>
              </div>

              <template v-else>
                <linear-lock-chart :lock="lock" :tokenHydrated="tokenHydrated"></linear-lock-chart>
              </template>

            </div>

          </div>
        </div>
      </div>
    </v-expand-transition>
  </div>
</template>

<script>
import CDate from '@/components/ui/date-picker'
import moment from 'moment'
import LinearLockChart from '@/views/locker/erc20/charts/linear-lock'
import Utils from '@/web3/utils'

export default {
  props: {
    lock: {
      type: Object,
      default: () => {}
    },
    tokenHydrated: {
      type: Object,
      default: () => ({
        symbol: '',
        name: '',
        decimals: '0'
      })
    },
    balance: {
      type: String,
      default: '0'
    }
  },

  components: {
    CDate,
    LinearLockChart
  },

  data: () => ({
    expandMenu: false,
    amountHuman: '0',
  }),

  computed: {
    sClient () {
      return this.$store.state.signer
    },
    unlockerAddressCondensed () {
      var address = this.lock.owner
      if (!address) {
        return ''
      }
      return address.slice(0, 6) + '...' + address.slice(address.length - 4)
    },
    unlockerIsMe: {
      get () {
        return this.lock.owner === this.sClient.address
      },
      set (_bool) {
        if (_bool) {
          this.lock.owner = this.sClient.address
        } else {
          this.lock.owner = ''
        }
      }
    },
    lockType1: {
      get () {
        // return false
        return this.lock.start_emission === 0
      },
      set (_bool) {
        if (_bool) {
          this.lock.start_emission = 0
        } else {
          this.lock.start_emission = moment().unix()
        }
      }
    },
    minimumLockAmount () {
      return 0
      // var amount = ethers.utils.formatUnits(100, this.tokenHydrated.decimals)
      // return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: this.tokenHydrated.decimals})
    },
    tokenBalanceHuman () {
      var amount = Utils.convertMicroDenomToDenom(this.balance, this.tokenHydrated.decimals)
      return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 6})
    },
    amountHumanWithCommas () {
      return Number(this.amountHuman).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: this.tokenHydrated.decimals})
    },
    startDateHuman () {
      return moment.unix(this.lock.start_emission).format('DD MMM YYYY HH:mm')
    },
    startDateFromNow () {
      return moment.unix(this.lock.start_emission).fromNow()
    },
    endDateHuman () {
      return moment.unix(this.lock.end_emission).format('DD MMM YYYY HH:mm')
    },
    endDateFromNow () {
      return moment.unix(this.lock.end_emission).fromNow()
    },
    ownerIsValid () {
      return true
      // return ethers.utils.isAddress(this.lock.owner)
    },
    errorMinimumLockAmount () {
      return false
      // return this.lock.amount < 100
    }
  },

  watch: {
  },

  methods: {
    setMax () {
      this.lock.amount = this.balance
      this.amountHuman = Utils.convertMicroDenomToDenom(this.balance, this.tokenHydrated.decimals)
    },
    setPercent (percent) {
      this.lock.amount = this.balance * percent / 100
      this.amountHuman = Utils.convertMicroDenomToDenom(this.lock.amount, this.tokenHydrated.decimals)
    },
    setStartEmission (date) {
      this.lock.start_emission = date.unix()
    },
    setEndEmission (date) {
      if (this.lockType1) {
        this.lock.end_emission = date.unix()
      }
      this.lock.end_emission = date.unix()
    },
    onHumanAmountChange (val) {
      this.lock.amount = Utils.convertDenomToMicroDenom(val, this.tokenHydrated.decimals)
    },
  },

  created () {
    this.amountHuman = Utils.convertMicroDenomToDenom(this.lock.amount, this.tokenHydrated.decimals)
  }
}
</script>