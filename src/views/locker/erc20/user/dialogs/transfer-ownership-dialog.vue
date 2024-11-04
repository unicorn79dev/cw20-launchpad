<template>
  <v-dialog v-model="dialog" persistent max-width="450" content-class="br-20">
    <v-card class="br-20">

      <v-card-text>
        
        <v-row class="ma-0 align-center">
          <div class="pt-3 pb-3">
            Transfer ownership
          </div>
          <v-spacer></v-spacer>
          <v-btn @click="cancel" large icon color="textFaint">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-row>

        <div class="mt-10">
          Transfer this lock to a new owner
        </div>
        <div class="caption">
          The specified address will be able to withdraw the tokens once the unlock date is reached.
        </div>

        <div class="mt-2 d-flex align-center pa-3 r-outlined br-20 inputcolor">
          <c-input :value.sync="unlockerAccount" placeholder="New owner address...">
          </c-input>
        </div>

      </v-card-text>

      <v-row dense class="ma-2">
        <v-btn x-large block rounded depressed @click="transferLockOwnership" class="white--text grad-green" :loading="withdrawLoading">
          Transfer
          <v-icon class="ml-2">mdi-arrow-up</v-icon>
        </v-btn>
      </v-row>

    </v-card>
  </v-dialog>
</template>

<script>
import CInput from '@/components/ui/input'
import SETTINGS from '@/store/settings'
import Utils from '@/web3/utils'

export default {
  components: {
    CInput
  },
  data: () => ({
    dialog: false,
    resolve: null,
    reject: null,
    unlockerAccount: '',
    loading: false,
    withdrawLoading: false,
    lock: {}
  }),

  computed: {
    sClient () {
      return this.$store.state.signer
    },
    reqNetwork () {
      return this.$store.state.requiredNetwork
    },
    withdrawableBalanceHuman () {
      var amount = Utils.convertMicroDenomToDenom(this.lock.amount, 6)
      return Number(amount).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 4})
    },
  },

  watch: {
    
  },

  methods: {
    open (lock) {
      this.lock = lock
      this.dialog = true
      return new Promise((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    },
    setMax () {
      this.amount = this.lock.amount
      this.amountHuman = Utils.convertMicroDenomToDenom(this.lock.amount, 6)
    },
    cancel () {
      this.reject()
      this.dialog = false
    },
    async transferLockOwnership () {
      this.withdrawLoading = true
      const CONTRACT_ADDRESS = SETTINGS.CHAINS[this.reqNetwork].tokenLocker
      const defaultFee = SETTINGS.CHAINS[this.reqNetwork].defaultFee

      this.$root.$dialog.confirmTx.open()
      try {
        const txhash = await this.sClient.signedClient.execute(
          this.sClient.address,
          CONTRACT_ADDRESS,
          {
            "transfer_lock_ownership": {
              "lockid": this.lock.lock_id,
              "new_owner": this.unlockerAccount
            }
          },
          defaultFee,
          undefined,
          []
        )

        this.$root.$dialog.confirmTx.close()

        this.resolve()
        this.dialog = false

        console.log("lock txhash: ", txhash)
      } catch (err) {
        console.log(err)
        this.$root.$dialog.confirmTx.close()
        this.$root.$dialog.web3Error.open(err.message)
      }

      this.withdrawLoading = false
    }
  },

  created () {
    this.filteredTokens = this.savedTokens
  }
}
</script>