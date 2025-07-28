interface FAQItem {
  id: string
  question: string
  answer: string
  hasLink?: boolean
  linkText?: string
  linkUrl?: string
}

export const FAQ_DATA: FAQItem[] = [
  {
    id: 'item-1',
    question: 'How does AI generate flashcards?',
    answer:
      'Our AI, powered by Google Gemini, scans your text to identify key ideas and automatically generates effective question-answer flashcards.',
  },
  {
    id: 'item-2',
    question: 'Can I save and organize flashcards?',
    answer:
      'Absolutely! Save flashcards into collections, track your progress, and sync them across all your devices in real time.',
  },
  {
    id: 'item-3',
    question: 'What kind of content works best?',
    answer:
      'You can paste any educational material—textbooks, notes, papers, or guides. The AI works best with clear, topic-based content.',
  },
  {
    id: 'item-4',
    question: 'What’s included in the Basic and Pro plans?',
    answer:
      'Basic gives you 1,000 flashcards for ₹100/month. Pro includes 100,000 flashcards, unlimited collections, priority support, and advanced analytics for ₹500/month.',
  },
  {
    id: 'item-5',
    question: 'Is offline access available?',
    answer:
      'Yes! While generating flashcards requires internet, you can study offline once your cards are synced to your device.',
  },
]
