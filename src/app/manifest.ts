import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'WZ Solution - Desenvolvimento de Software',
    short_name: 'WZ Solution',
    description: 'Soluções digitais inovadoras para transformar suas ideias em realidade digital',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#06b6d4',
    orientation: 'portrait-primary',
    scope: '/',
    icons: [
      {
        src: '/images/wzlogo_trans.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/images/wzlogo_trans.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ],
    categories: ['business', 'productivity', 'technology'],
    lang: 'pt-BR',
    dir: 'ltr',
    screenshots: [
      {
        src: '/images/screenshot-mobile.png',
        sizes: '390x844',
        type: 'image/png',
        form_factor: 'narrow'
      },
      {
        src: '/images/screenshot-desktop.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide'
      }
    ],
    shortcuts: [
      {
        name: 'Solicitar Orçamento',
        short_name: 'Orçamento',
        description: 'Solicite um orçamento para seu projeto',
        url: '/#budget',
        icons: [{ src: '/images/wzlogo_trans.png', sizes: '96x96' }]
      },
      {
        name: 'Contato',
        short_name: 'Contato',
        description: 'Entre em contato conosco',
        url: '/#contact',
        icons: [{ src: '/images/wzlogo_trans.png', sizes: '96x96' }]
      }
    ]
  }
}
