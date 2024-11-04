<template>
  <v-container style="max-width: 600px;">
    
    <v-slide-x-transition appear>
      <div :class="['br-20 mb-16', {'pa-4': $vuetify.breakpoint.xs}, {'pa-6': !$vuetify.breakpoint.xs}]">
        
        <div class="mb-3 title text-center textFaint--text">
          Select Network
        </div>

        <div class="v-card d-flex align-center c-list pa-4 br-20 mb-2" @click="selectChain('Mainnet')">
          <img 
          :src="$settings.CHAINS['Mainnet'].icon" 
          height="40px"
          width="40px"
          class="mr-3">
          <div>
            <div class="title">
              Ethereum mainnet
            </div>
          </div>
        </div>

        <div class="v-card d-flex align-center c-list pa-4 br-20 mb-2" @click="selectChain('BSC_MAINNET')">
          <img 
          :src="$settings.CHAINS['BSC_MAINNET'].icon" 
          height="40px"
          width="40px"
          class="mr-3">
          <div>
            <div class="title">
              Binance Smart Chain
            </div>
          </div>
        </div>
        
      </div>
    </v-slide-x-transition>
    
  </v-container>
</template>

<script>
export default {

  data: () => ({
  }),

  computed: {
  },

  methods: {
    selectChain (requiredChain) {
      this.$store.commit('switchChain', requiredChain)
      if (this.$route.query.redirect === 'locker') {
        this.$router.push(`${this.$store.state.chainPrefix}/locker`)
      } else if (this.$route.query.redirect === 'minter') {
        this.$router.push(`${this.$store.state.chainPrefix}/minter`)
      } else {
        this.$router.push('/dashboard')
      }
    }
  },

  created () {
  }
}
</script>