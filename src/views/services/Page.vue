<template>
  <v-container style="max-width: 600px;">
    
    <v-slide-y-transition appear>
    <div :class="['mb-16', {'foreground v-card br-20': $vuetify.breakpoint.xs}, {'v-card br-20 foreground': !$vuetify.breakpoint.xs}]">
      
      <div class="py-6 title text-center textFaint--text">
        Our CW20 Lockers
      </div>

      <router-link 
      to="/liquidity"
      v-slot="{ navigate }">
        <div class="d-flex align-center c-list pa-4 border-b" @click="navigate">
          <img 
          src="@/assets/img/icons/padlock.svg" 
          height="60px"
          width="60px"
          class="mr-3 greyscale">

          <div>
            <div class="">
              Liquidity Locker
            </div>
            <div class="caption textFaint--text">
              Lock Liquidity tokens
            </div>
          </div>
        </div>
      </router-link>

      <router-link 
      to="/token"
      v-slot="{ navigate }">
        <div class="d-flex align-center c-list pa-4 border-b" @click="navigate">
          <img 
          src="@/assets/img/icons/padlock.svg" 
          height="60px"
          width="60px"
          class="mr-3 greyscale">
          <div>
            <div class="">
              Token Locker
            </div>
            <div class="caption textFaint--text">
              Lock your CW20 tokens
            </div>
            <div class="caption textFaint--text">
              Send locked tokens to someone else for a configurable period
            </div>
          </div>
        </div>
      </router-link>
      
    </div>
    </v-slide-y-transition>
    
  </v-container>
</template>

<script>
export default {

  data: () => ({
  }),

  computed: {
  },

  methods: {
  },

  created () {
  }
}
</script>