import Vue from 'vue'
import VueRouter from 'vue-router'
import ErrorPage from '@/views/404/Page.vue'

import ExchangeSwitcher from '@/views/ExchangeSwitcher'
import Tokens from '@/views/tokens/Page.vue'
import Token from '@/views/token/Page.vue'
import Pairs from '@/views/pairs/Page.vue'
import Pair from '@/views/pair/Page.vue'

import Lockerv1 from '@/views/lockerv1/Page.vue'
import LockERC20 from '@/views/locker/erc20/Page.vue'

import Services from '@/views/services/Page'

Vue.use(VueRouter)

const routes = [
  {
    path: '/token',
    name: 'Lock CW20',
    component: LockERC20,
  },
  {
    path: '/liquidity',
    name: 'Lock LP',
    component: Lockerv1
  },
  {
    path: '/',
    name: 'Default',
    component: Services
  },
  {
    path: '/services',
    name: 'Services',
    component: Services,
  },
  {
    path: '/browser',
    component: ExchangeSwitcher,
    props: true,
    children: [
      // TOKENS
      {
        path: 'tokens',
        name: 'TokensPage',
        component: Tokens,
      },
      {
        path: 'token/:address',
        name: 'Token',
        props: true,
        component: Token
      },
      {
        path: 'pairs',
        name: 'PairsComponent',
        component: Pairs
      },
      {
        path: 'pair/:address',
        name: 'Pair',
        props: true,
        component: Pair
      },
    ]
  },
  // MISC
  {
    path: "*",
    component: ErrorPage
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  }
})

export default router
