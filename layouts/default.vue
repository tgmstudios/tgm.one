<template>
  <div>
    <HeaderSection :logo="logoURL" :menu="headerMenu"/>
    <main>
      <slot />
    </main>
    <FooterSection :menu="headerMenu"/>
  </div>
</template>

<script setup>
import HeaderSection from '~/components/HeaderSection.vue'
import FooterSection from '~/components/FooterSection.vue'
import logoURL from '~/assets/logo.png'
import { useHeaderMenu } from '~/composables/useHeaderMenu'

const { headerMenu } = useHeaderMenu()
</script>

<style scoped>
main {
  min-height: 60vh;
}
</style>


