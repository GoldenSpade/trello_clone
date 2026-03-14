// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      title: 'Taskboard',
      meta: [
        { name: 'description', content: 'A Trello-like project management board' },
      ],
    },
  },

  modules: ['@nuxtjs/tailwindcss'],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      appsScriptUrl: '',
    },
  },
})
