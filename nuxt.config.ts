// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,

  app: {
    baseURL: '/trello_clone/',
    head: {
      title: 'Taskboard',
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/trello_clone/favicon.ico' },
      ],
      meta: [
        {
          name: 'description',
          content: 'A Trello-like project management board',
        },
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
