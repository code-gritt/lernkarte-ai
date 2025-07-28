interface Feature {
  title: string
  description: string
  src: string
}

export const FEATURES: Feature[] = [
  {
    title: 'Effortless Text Input',
    description:
      'Just paste your notes, articles, or textbook content. Our AI takes care of the rest—no formatting needed.',
    src: '/images/features/feature-1.jpeg',
  },
  {
    title: 'AI-Powered Flashcard Generation',
    description:
      'Built on Google Gemini, our AI intelligently detects key ideas and auto-generates question-answer pairs.',
    src: '/images/features/feature-2.jpg',
  },
  {
    title: 'Engaging Study Experience',
    description:
      'Swipe through beautifully animated cards and reinforce learning with progress tracking and smart repetition.',
    src: '/images/features/feature-3.jpg',
  },
  {
    title: 'Cross-Device Sync',
    description:
      'Access your flashcards anytime, anywhere—from mobile, tablet, or desktop. Always synced and ready to study.',
    src: '/images/features/feature-4.jpeg',
  },
]
