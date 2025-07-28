interface VideoConfig {
  videoSrc: string
  lightThumbnail: {
    src: string
    alt: string
  }
  darkThumbnail: {
    src: string
    alt: string
  }
}

interface HeroConfig {
  title: string
  description: string
  buttonText: string
  videoConfig: VideoConfig
}

export const HERO: HeroConfig = {
  title: 'Master Any Subject with AI-Powered Flashcards',
  description:
    'Instantly convert textbooks, notes, or web content into smart flashcards using advanced AI. Maximize your study efficiency with personalized, interactive cards.',
  buttonText: 'Start Creating Flashcards',
  videoConfig: {
    videoSrc: '/videos/ren.mp4',
    lightThumbnail: {
      src: 'https://startup-template-sage.vercel.app/hero-light.png',
      alt: 'AI Flashcard Generator',
    },
    darkThumbnail: {
      src: 'https://startup-template-sage.vercel.app/hero-dark.png',
      alt: 'AI Flashcard Generator',
    },
  },
}
