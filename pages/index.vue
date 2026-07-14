<template>
  <div class="home">
    <SeoContent />
    <!-- Early LCP anchor: renders a large text element instantly to capture LCP before the animation/globe -->
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-0" aria-hidden="true">
      <h1 class="text-4xl md:text-6xl font-extrabold text-white/90 text-center px-4" style="content-visibility: visible; contain: none;">
        Aiden Johnson
      </h1>
    </div>
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
      this.showGlobe = true;
    },
    skipAnimation() {
      this.showTextAnimation = false;
      this.showGlobe = true;
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
