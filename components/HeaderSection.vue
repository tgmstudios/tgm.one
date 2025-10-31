<template>
  <header>
    <NuxtLink :key="1" :to="'/'" class="logo" aria-label="Home"><img :src="logo" alt="TGM.One Logo"></NuxtLink>
    <nav :class="{ open: isMenuOpen }">
      <NuxtLink v-for="link in menu" :key="link.id" :to="link.url">{{link.text}}</NuxtLink>
    </nav>
    <a href="#" class="account" aria-label="Account" title="Account">
      <UserIcon />
    </a>
    <button class="menu-toggle" @click="isMenuOpen = !isMenuOpen" aria-label="Toggle navigation">
      <component :is="isMenuOpen ? 'XMarkIcon' : 'Bars3Icon'" />
    </button>
  </header>  
</template>

<script>
import { UserIcon, Bars3Icon, XMarkIcon } from '@heroicons/vue/24/solid'

export default {
  name: 'HeaderSection',
  props: {
    menu: Array,
    logo: String
  },
  components: { UserIcon, Bars3Icon, XMarkIcon },
  data() {
    return {
      isMenuOpen: false
    }
  },
  watch: {
    $route() {
      this.isMenuOpen = false
    }
  }
}
</script>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  padding: 0px 20px;
}
.logo img, .account img {
  width: 67px;
}
.account svg {
  width: 30px;
  height: auto;
  color: #E5DED4;
  margin-top:50%;
}

nav {
  padding: 30px;
}
nav a {
    font-weight: 800;
    letter-spacing: 1.1px;
    font-size: 16px;
    text-transform: uppercase;
    text-underline-offset: 8px;
    text-decoration: none;
    padding: 12px;
    color: #E5DED4;
}
nav a:hover {
    color: #0054ff;
    text-decoration: underline;
    text-decoration-thickness: 1px;
}
nav a.router-link-exact-active {
    color: #ffdb00;
    text-decoration: underline;
    text-decoration-thickness: 2px;
}

.menu-toggle {
  display: none;
  background: transparent;
  border: none;
  padding: 0;
  margin: 0 8px;
}
.menu-toggle svg {
  width: 32px;
  height: 32px;
  color: #E5DED4;
}

@media (max-width: 768px) {
  header {
    align-items: center;
    position: relative;
    padding: 10px 14px;
  }
  .account {
    display: none;
  }
  .menu-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  nav {
    position: absolute;
    top: 64px;
    left: 0;
    right: 0;
    background: rgba(10, 10, 10, 0.98);
    border-top: 1px solid rgba(229, 222, 212, 0.1);
    display: none;
    padding: 12px 10px;
    z-index: 50;
    text-align: right;
  }
  nav.open {
    display: block;
  }
  nav a {
    display: block;
    padding: 12px 16px;
    text-align: right;
  }
}
</style>
