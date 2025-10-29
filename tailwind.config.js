/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app.vue',
    './layouts/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './components/**/*.{vue,js,ts}',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.100'),
            a: {
              color: theme('colors.blue.400'),
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            },
            h1: { color: theme('colors.gray.100') },
            h2: { color: theme('colors.gray.100') },
            h3: { color: theme('colors.gray.100') },
            code: {
              backgroundColor: theme('colors.white / 0.06'),
              padding: '0.2rem 0.35rem',
              borderRadius: '0.375rem'
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: '0'
            },
            pre: {
              backgroundColor: theme('colors.white / 0.04'),
              color: theme('colors.gray.100')
            },
            blockquote: {
              borderLeftColor: theme('colors.white / 0.2'),
              color: theme('colors.gray.200')
            }
          }
        },
        invert: {
          css: {
            color: theme('colors.gray.100')
          }
        }
      })
    }
  },
  plugins: [
    require('@tailwindcss/typography')
  ]
}


