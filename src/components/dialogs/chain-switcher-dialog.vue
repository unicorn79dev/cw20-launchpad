<template>
  <v-dialog v-model="dialog" scrollable persistent max-width="450" content-class="br-20">
    <v-card class="foreground br-20">
      <div class="d-flex align-center title px-4 py-3 border-b background" style="font-size: 1rem;">
        <div style="width: 24px;">

        </div>
        <v-spacer></v-spacer>
        Switch Network
        <v-spacer></v-spacer>
        <v-btn icon color="text" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-card-text class="pa-0">

        <div class="d-flex align-center c-list pa-4 border-b" @click="selectChain('INJ')">
          <img width="50px" class="mr-3 br-20" src="https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/inj.svg">
          <div>
            <div class="title">
              Injective
            </div>
          </div>
        </div>

        <div class="d-flex align-center c-list pa-4" @click="selectChain('SEI')">
          <img width="36px" class="ml-2 mr-5 br-20" src="https://raw.githubusercontent.com/cosmos/chain-registry/master/sei/images/sei.svg">
          <div>
            <div class="title">
              Sei
            </div>
          </div>
        </div>

        <!-- <div class="textFaint--text py-2 background text-center">
          Testnets
        </div>

        <div class="d-flex align-center c-list pa-4 border-b" @click="selectChain('INJ_TESTNET')">
          <img width="50px" class="mr-3 br-20 greyscale" src="https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/inj.svg">
          <div>
            <div class="title textFaint--text">
              Injective Testnet
            </div>
          </div>
        </div>

        <div class="d-flex align-center c-list pa-4 border-b" @click="selectChain('SEI_TESTNET')">
          <img width="36px" class="ml-2 mr-5 br-20 greyscale" src="https://raw.githubusercontent.com/cosmos/chain-registry/master/sei/images/sei.svg">
          <div>
            <div class="title textFaint--text">
              Atlantic-2 Testnet
            </div>
          </div>
        </div> -->

      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data: () => ({
    dialog: false,
  }),

  methods: {
    open () {
      this.dialog = true
    },
    close () {
      this.dialog = false
    },
    selectChain (requiredChain) {
      this.$store.commit('switchChain', requiredChain)
      this.close()
    }
  }
}
</script>

<style scoped lang="scss">
.draw-icon {
  fill:transparent;
  stroke-width:5px;

  path{
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    animation: dash 1.5s linear forwards;
    // animation: dash 5s cubic-bezier(.645,.045,.355,1);
  }
}

@keyframes dash {
  to {
    stroke-dashoffset: 0;
  }
}
</style>