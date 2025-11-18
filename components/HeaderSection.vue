<template>
  <header :class="{ 'scrolled': isScrolled }">
    <NuxtLink :key="1" :to="'/'" class="logo" aria-label="Home"><img :src="logo" alt="TGM.One Logo"></NuxtLink>
    <nav :class="{ open: isMenuOpen }">
      <NuxtLink v-for="link in menu" :key="link.id" :to="link.url">{{link.text}}</NuxtLink>
    </nav>
    <NuxtLink to="/search" class="account" aria-label="Search" title="Search">
      <MagnifyingGlassIcon />
    </NuxtLink>
    <button class="menu-toggle" @click="isMenuOpen = !isMenuOpen" aria-label="Toggle navigation">
      <component :is="isMenuOpen ? 'XMarkIcon' : 'Bars3Icon'" />
    </button>
  </header>  
</template>

<script>
import { MagnifyingGlassIcon, Bars3Icon, XMarkIcon } from '@heroicons/vue/24/solid'

export default {
  name: 'HeaderSection',
  props: {
    menu: Array,
    logo: String
  },
  components: { MagnifyingGlassIcon, Bars3Icon, XMarkIcon },
  data() {
    return {
      isMenuOpen: false,
      isScrolled: false
    }
  },
  mounted() {
    this.handleScroll()
    window.addEventListener('scroll', this.handleScroll)
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    handleScroll() {
      this.isScrolled = window.scrollY > 50
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
  align-items: center;
  padding: 0px 20px;
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(10, 10, 10, 0.7);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  border-bottom: 1px solid transparent;
  min-height: 67px;
}

header.scrolled {
  padding: 0px 20px;
  background: rgba(10, 10, 10, 0.8);
  border-bottom: 1px solid rgba(229, 222, 212, 0.1);
  min-height: 50px;
}

.logo img, .account img {
  width: 67px;
  transition: width 0.3s ease;
}

header.scrolled .logo img {
  width: 50px;
}

.account {
  display: flex;
  align-items: center;
  justify-content: center;
}

.account svg {
  width: 30px;
  height: 30px;
  color: #E5DED4;
  transition: width 0.3s ease, height 0.3s ease;
}

header.scrolled .account svg {
  width: 24px;
  height: 24px;
}

nav {
  padding: 30px;
  transition: padding 0.3s ease;
}

header.scrolled nav {
  padding: 15px;
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
    transition: font-size 0.3s ease, padding 0.3s ease;
}

header.scrolled nav a {
    font-size: 14px;
    padding: 8px;
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
    padding: 10px 14px;
  }
  
  header.scrolled {
    padding: 8px 14px;
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
  
  header.scrolled nav {
    top: 56px;
  }
  
  nav.open {
    display: block;
  }
  
  nav a {
    display: block;
    padding: 12px 16px;
    text-align: right;
  }
  
  header.scrolled nav a {
    padding: 10px 16px;
  }
}
</style>
