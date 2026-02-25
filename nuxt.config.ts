// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  devServer: {
    host: '0.0.0.0',
    port: '3000'
  },
  app: {
    head: {
      link: [
        // Precargar la fuente de iconos ANTES de renderizar
        {
          rel: 'preload',
          href: '/fonts/primeicons.woff2',
          as: 'font',
          type: 'font/woff2',
          crossorigin: ''
        }
      ],
      style: [
        {
          children: `
            *, *::before, *::after { box-sizing: border-box; }
            html { overflow-y: scroll; scrollbar-gutter: stable; height: 100%; }
            body { margin: 0; padding: 0 !important; min-height: 100%; }
            body.p-overflow-hidden { padding-right: 0 !important; overflow-y: scroll !important; }
            /* Reservar espacio para iconos antes de que cargue la fuente */
            .pi { display: inline-block; width: 1em; height: 1em; }
          `
        }
      ]
    }
  },
  vite: {
    css: {
      devSourcemap: false
    },
    build: {
      cssCodeSplit: false
    }
  },
  modules: ['nuxt-primevue', '@nuxtjs/tailwindcss', '@nuxtjs/eslint-module', '@pinia/nuxt'],
  primevue: {
    usePrimeVue: true,
    options: {
      scrollLock: false,
      unstyled: false, // Correcto para usar el tema (Lara, Aura, etc.)
      ripple: false,
      inputStyle: 'filled'
    },
    cssLayerOrder: 'tailwind-base, primevue, tailwind-utilities',
    config: {
      transitionOptions: {
        showTransitionOptions: '0ms',
        hideTransitionOptions: '0ms'
      }
    },
    components: {
      include: '*'
    },
    directives: {
      include: ['Ripple', 'Tooltip']
    }
  },
  build: {
    transpile: ['@fortawesome/vue-fontawesome']
  },
  css: [
    '@fortawesome/fontawesome-svg-core/styles.css',
    'primevue/resources/themes/aura-light-green/theme.css',
    'primevue/resources/primevue.min.css',
    '~/assets/css/tailwind.css',
    'primeicons/primeicons.css',
    '~/assets/scss/main.scss'
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  }
})
