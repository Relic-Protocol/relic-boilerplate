<script setup lang="ts">
import { RouterView } from 'vue-router'
import { init } from '@web3-onboard/vue'
import injectedWallets from '@web3-onboard/injected-wallets'

init({
  wallets: [injectedWallets()],
  chains: [
    {
      id: '0x1',
      token: 'ETH',
      label: 'Localhost',
      rpcUrl: 'http://127.0.0.1:8545/'
    }
  ],
  accountCenter: {
    desktop: {
      enabled: false
    },
    mobile: {
      enabled: false
    }
  }
})
</script>

<template>
  <RouterView />
</template>
