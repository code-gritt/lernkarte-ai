interface CTA {
  title: string
  description: string
  buttonText: string
  image: {
    src: string
    alt: string
    width: number
    height: number
  }
}

export const CTA_CONSTANT: CTA = {
  title: 'Boost Your Learning with AI',
  description:
    'Join thousands of students using AI-generated flashcards to study more efficiently and retain more information.',
  buttonText: 'Create Your First Flashcards',
  image: {
    src: '/images/cta/duck.png',
    alt: 'Smart Studying with AI',
    width: 500,
    height: 500,
  },
}
