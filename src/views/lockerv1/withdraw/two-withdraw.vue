<template>
  <div>
    <withdraw-v2 :uniPair="uniPair"></withdraw-v2>
  </div>

</template>

<script>
import WithdrawV2 from './withdraw-v2'

export default {
  components: {
    WithdrawV2,
  },

  props: {
    uniPair: String
  },

  data: () => ({
    version: 1
  }),

  methods: {
  }
}
</script>