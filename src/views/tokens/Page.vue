<template>
  <v-container style="max-width: 600px;" :class="[{'pa-0': $vuetify.breakpoint.xs}]">

    <div :class="['mb-16', {'foreground': $vuetify.breakpoint.xs}, {'v-card br-20': !$vuetify.breakpoint.xs}]">
      <div>

        <div>
          <all-tokens></all-tokens>
        </div>

      </div>

    </div>
    
  </v-container>
</template>

<script>
import AllTokens from './all-tokens'

export default {
  name: 'TokensPage',
  components: {
    AllTokens,
  },

  data: () => ({
    tab: 0,
    showAdvert: true
  }),

  computed: {
  },

  created () {
  }
}
</script>