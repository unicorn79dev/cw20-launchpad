<template>
  <div>
    <v-slide-y-transition appear>
      <div>
        <div class="justify-center mx-auto" style="max-width: 580px;">

          <div class="d-flex border-b foreground border br-8 mt-3" style="overflow: hidden;">
            <router-link 
            :to="`/browser/pairs`"
            v-slot="{ isActive, navigate }" custom>
              <div :class="['top-tab', {'active': isActive}]" @click="navigate">
                <v-icon size="20" class="mr-1">mdi-checkbox-multiple-blank-circle-outline</v-icon>
                <span>Pairs</span>
              </div>
            </router-link>

            <router-link 
            :to="`/browser/tokens`"
            v-slot="{ isActive, navigate }" custom>
              <div :class="['top-tab', {'active': isActive}]" @click="navigate">
                <v-icon size="20" class="mr-1">mdi-checkbox-blank-circle-outline</v-icon>
                <span>Tokens</span>
              </div>
            </router-link>
            
          </div>

        </div>

        <keep-alive include="CronTab,TokensPage,PairsComponent,Presales">
          <router-view :key="$route.fullPath"></router-view>
        </keep-alive>
      </div>
    </v-slide-y-transition>
  </div>
</template>

<script>

export default {
  data: () => ({
  }),

  created () {
  }
}
</script>