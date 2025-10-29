<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
.page-enter-active, .page-leave-active {
  transition: opacity .25s ease, transform .25s ease;
}
.page-enter-from, .page-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

/* Home page (index) should not animate on inbound (enter), but should animate on leave */
.page-no-enter-enter-active {
  transition: none;
}
.page-no-enter-enter-from {
  opacity: 1;
  transform: translateY(0);
}
.page-no-enter-leave-active {
  transition: opacity .25s ease, transform .25s ease;
}
.page-no-enter-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
