<template>
  <div>

    <div v-if="loading" class="text-center">
      <v-progress-circular
      indeterminate
      size="80"
      color="textFaint">
        <v-icon size="60" color="textFaint">mdi-lock-outline</v-icon>
      </v-progress-circular>
    </div>
    <template v-else>
      <locked-pair-row v-for="token of usersLockedTokens" :key="token.address" :item="token" @on-select="$emit('on-select', token)"></locked-pair-row>
    </template>
  </div>
</template>

<script>
import LockedPairRow from './locked-pairs-row'
import SETTINGS from '@/store/settings'

export default {
  components: {
    LockedPairRow
  },

  data: () => ({
    loading: true,
    usersLockedTokens: []
  }),

  computed: {
    sClient () {
      return this.$store.state.signer
    },
    reqNetwork () {
      return this.$store.state.requiredNetwork
    },
  },
  
  methods: {
    async getLockedTokens () {
      console.log("GET LOCKED TOKENS")
      const msg1 = {
        "get_user_num_locked_tokens": {
          "user": this.sClient.address,
        },
      }
      
      console.log("MSG 1 = ", msg1)
      console.log("R_Client = ", this.sClient.client)
      const CONTRACT_ADDRESS = SETTINGS.CHAINS[this.reqNetwork].lpLocker
      console.log("Contract Address = ", CONTRACT_ADDRESS)

      try {
        var numTokens = await this.sClient.client.queryContractSmart(CONTRACT_ADDRESS, msg1)
        console.log("NUM_TOKENS", numTokens)
        var tokens = []
        for (var i = 0; i < numTokens; i++) {
          const msg2 = {
            "get_user_locked_token_at_index": {
              "user": this.sClient.address,
              "index": i,
            }
          }
          var address = await this.sClient.client.queryContractSmart(CONTRACT_ADDRESS, msg2)
          var token = address
          tokens.push(token)
        }
        this.usersLockedTokens = tokens
      } catch (err) {
        console.log(err)
      }
    },
  },

  created () {
    this.getLockedTokens()
      .then(() => {
      })
      .catch(e => {})
      .then(() => {
        this.loading = false
      })
  }
}
</script>