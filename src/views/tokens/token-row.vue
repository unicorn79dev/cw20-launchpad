<template>
  <div outlined
  :class="['c-list', 
  {'pa-4 border-b br-0 foreground': $vuetify.breakpoint.xs}, 
  {'pa-4 border-b': !$vuetify.breakpoint.xs}]" 
  @click="goToTokenPage" style="position: relative;">

    <v-icon size="80" class="watermark" style="position: absolute; left: -30px; top: 20px;">mdi-lock-outline</v-icon>
    
    <div style="position: relative;">
      <div style="word-break: break-word;">
        <div class="d-flex align-center">
          <coin-icon :address="item.address" :url="item.icon_url" class="mr-2" :size="22"></coin-icon>
          <div text class="title pa-0 font-weight-bold" style="min-width: 10px;">
            <span class="text-truncate" :style="$vuetify.breakpoint.xs ? 'max-width: 10ch;' : 'max-width: 20ch;'">
              {{ `${item.symbol} / ${item.name}` }}
            </span>
          </div>

          <v-spacer></v-spacer>
          <div :class="['font-weight-medium']">
            {{ item.address.slice(0, 8) + '...' + item.address.slice(item.address.length - 4) }}
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>

export default {
  props: {
    item: {},
    index: {
      type: Number,
      default: null
    }
  },

  computed: {
  },

  methods: {
    goToTokenPage () {
      this.$router.push(`/browser/token/${this.item.address}`)
      this.$emit('on-close')
    }
  }
}
</script>