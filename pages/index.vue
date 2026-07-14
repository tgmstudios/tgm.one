<template>
  <div class="home">
    <SeoContent />
    <SkipButton 
      v-if="showTextAnimation" 
      @skip="skipAnimation"
      :header-height="headerHeight"
    />
    <TextAnimation v-if="showTextAnimation" @animation-complete="onAnimationComplete"/>
    <GlobeWidget v-if="showGlobe" />
  </div>
</template>

<script>
// @ is an alias to /src
import TextAnimation from '~/components/TaglineWidget.vue'
import GlobeWidget from '~/components/GlobeWidget.vue'
import SkipButton from '~/components/SkipButton.vue'

export default {
  name: 'HomeView',
  components: {
    TextAnimation,
    GlobeWidget,
    SkipButton
  },
  data() {
    return {
      showTextAnimation: true,
      showGlobe: false,
      headerHeight: '67px'
    };
  },
  mounted() {
    this.updateHeaderHeight()
    window.addEventListener('scroll', this.updateHeaderHeight)
    window.addEventListener('resize', this.updateHeaderHeight)
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.updateHeaderHeight)
    window.removeEventListener('resize', this.updateHeaderHeight)
  },
  methods: {
    onAnimationComplete() {
      this.showTextAnimation = false;
      this.deferGlobe();
    },
    skipAnimation() {
      this.showTextAnimation = false;
      this.deferGlobe();
    },
    deferGlobe() {
      // Defer heavy globe render until browser is idle, keeping LCP fast
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        requestIdleCallback(() => { this.showGlobe = true; }, { timeout: 2000 });
      } else {
        setTimeout(() => { this.showGlobe = true; }, 200);
      }
    },
    updateHeaderHeight() {
      if (typeof document !== 'undefined') {
        const header = document.querySelector('header')
        if (header) {
          this.headerHeight = `${header.offsetHeight}px`
        }
      }
    }
  }
}
</script>

<script setup>
definePageMeta({
  pageTransition: { name: 'page-no-enter', mode: 'out-in' }
})
</script>
