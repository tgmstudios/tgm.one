import { ref } from 'vue'

export function useHeaderMenu() {
  const headerMenu = ref([
    { id: 1, url: '/', text: 'Home' },
    { id: 2, url: '/projects', text: 'Projects' },
    { id: 3, url: '/blogs', text: 'Blog' },
    { id: 4, url: '/about', text: 'About' }
  ])

  return { headerMenu }
}


