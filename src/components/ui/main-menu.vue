<template>
  <v-dialog v-model="dialog" scrollable persistent max-width="450" content-class="br-20">
    <v-card class="foreground br-20">
      <div class="d-flex align-center title px-4 py-2 border-b" style="font-size: 1rem;">
        <div style="width: 24px;">

        </div>
        <v-spacer></v-spacer>
        Menu
        <v-spacer></v-spacer>
        <v-btn icon color="text" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-card-text class="pa-4">

        <!-- <div class="py-2 text-end">
          <v-btn text @click="changeTheme" color="textFaint">
            Change theme
            <v-icon small class="ml-3">mdi-white-balance-sunny</v-icon>
          </v-btn>
        </div> -->

        <a href="https://#" class="deadlink" target="_blank">
          <v-card class="pa-4 d-flex align-center c-list mb-1">
            <v-icon>mdi-file-document-outline</v-icon>
            <div class="ml-4">
              Documentation
            </div>
          </v-card>
        </a>

        <div class="mt-4 mb-2 d-flex align-center justify-center">
          <v-btn icon color="textFaint" x-large href="https://twitter.com/?" target="_blank">
            <v-icon>mdi-twitter</v-icon>
          </v-btn>
          <v-btn color="textFaint" x-large icon rounded href="https://t.me/?" target="_blank">
            <v-icon>mdi-telegram</v-icon>
          </v-btn>
        </div>

      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data: () => ({
    dialog: false,
    expandMenu: false
  }),

  methods: {
    changeTheme () {
      var themeName = "theme1"
      if (this.$store.state.theme === "theme1") {
        themeName = "theme2"
      }
      this.$store.commit('setTheme',{
        themeName: themeName,
        vuetify: this.$vuetify
      })
    },
    open () {
      this.dialog = true
    },
    close () {
      this.dialog = false
      this.expandMenu = false
    },
    goToSwap () {
      this.close()
      this.$router.push(`/swap`)
    }
  }
}
</script>

<style lang="scss">
.deadlink {
   text-decoration: none;
   color: unset!important;
}
</style>