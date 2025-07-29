'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import FirebaseConnectionStatus from '@/components/FirebaseConnectionStatus'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import databaseOperations from '@/server/actions/databaseOperations'
import { useGenerationStore } from '@/store/generationStore'

interface Flashcard {
  front: string
  back: string
}

interface FlashcardSet {
  id?: string
  name: string
  flashcards: Flashcard[]
  userId: string
  createdAt: Date
}

export default function GeneratePage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [flipped, setFlipped] = useState<boolean[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [setName, setSetName] = useState('')
  const [saving, setSaving] = useState(false)
  const { user } = useUser()
  const router = useRouter()

  // Access Zustand store
  const {
    userId,
    remainingFlashcards,
    paidTier,
    setUserId,
    updateRemainingFlashcards,
  } = useGenerationStore()

  // Set userId when user logs in or changes
  if (user && user.id !== userId) {
    setUserId(user.id) // This will reset state if it's a new userId
  }

  const handleSubmit = async () => {
    if (!text.trim()) {
      alert('Please enter some text to generate flashcards.')
      return
    }

    if (!user || !userId) {
      toast.error('Error', {
        description: 'Please sign in to generate flashcards.',
      })
      return
    }

    if (remainingFlashcards <= 0) {
      toast.error('Upgrade Required', {
        description:
          'Free generation limit reached (3 attempts). Upgrade to a $10/month plan for 1,000 flashcards!',
        action: {
          label: 'Upgrade Now',
          onClick: () => router.push('/#pricing'),
        },
      })
      return
    }

    setLoading(true)
    try {
      console.log('Sending request to generate flashcards...')
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id,
        },
        body: JSON.stringify({ text: text.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        toast.error('Error', {
          description: errorData.error || 'Failed to generate flashcards.',
        })
      } else {
        const result = await response.json()
        console.log('Received response:', result)

        if (
          result.flashcards &&
          Array.isArray(result.flashcards) &&
          result.flashcards.length > 0
        ) {
          setFlashcards(result.flashcards)
          setFlipped(new Array(result.flashcards.length).fill(false))
          const deduction = paidTier ? result.flashcards.length : 1
          updateRemainingFlashcards(remainingFlashcards - deduction)
          toast.success(
            result.message || 'Flashcards generated successfully!',
            {
              description: paidTier
                ? `${result.remainingAttempts} flashcards remaining.`
                : `${result.remainingAttempts} attempts remaining.`,
            }
          )
          console.log(
            'Successfully generated',
            result.flashcards.length,
            'flashcards'
          )
        } else {
          throw new Error('No flashcards generated')
        }
      }
    } catch (error) {
      console.error('Error generating flashcards:', error)
      toast.error('Error', {
        description: `An error occurred while generating flashcards: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    }
    setLoading(false)
  }

  const handleSaveFlashcards = async () => {
    if (!user) {
      alert('Please sign in to save flashcards.')
      return
    }

    if (!setName.trim()) {
      alert('Please enter a name for your flashcard set.')
      return
    }

    if (flashcards.length === 0) {
      alert('No flashcards to save.')
      return
    }

    setSaving(true)
    try {
      console.log('Saving flashcards to Firebase...')
      const flashcardSet: Omit<FlashcardSet, 'id'> = {
        name: setName.trim(),
        flashcards: flashcards,
        userId: user.id,
        createdAt: new Date(),
      }

      const docRef = await databaseOperations.saveFlashcardSet(flashcardSet)
      console.log('Flashcards saved with ID:', docRef.id)
      toast.success('Success', {
        description: 'Flashcards saved successfully!',
      })
      setSetName('')

      setTimeout(() => {
        router.push('/flashcards')
      }, 1000)
    } catch (error) {
      console.error('Error saving flashcards:', error)

      let errorMessage = 'Failed to save flashcards. '
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          errorMessage += 'Permission denied. Please check your authentication.'
        } else if (
          error.message.includes('network') ||
          error.message.includes('offline')
        ) {
          errorMessage +=
            'Network error. Please check your internet connection and try again.'
        } else if (error.message.includes('quota')) {
          errorMessage += 'Storage quota exceeded. Please contact support.'
        } else {
          errorMessage += error.message
        }
      } else {
        errorMessage += 'An unknown error occurred. Please try again.'
      }

      toast.error('Error', {
        description: errorMessage,
      })
    }
    setSaving(false)
  }

  const handleCardClick = (id: number) => {
    setFlipped(prev => {
      const newFlipped = [...prev]
      newFlipped[id] = !newFlipped[id]
      return newFlipped
    })
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-4xl mx-auto'>
        <Button
          variant='ghost'
          onClick={() => router.push('/')}
          className='mb-6 flex items-center gap-2 text-sm sm:text-base'
        >
          <ArrowLeft className='w-4 h-4' /> Back to Home
        </Button>

        <h1 className='text-3xl font-bold text-center mb-8 sm:text-4xl'>
          Generate Flashcards
        </h1>

        <div className='mb-8'>
          <Card className='w-full'>
            <CardHeader>
              <CardTitle className='text-xl sm:text-2xl'>
                Enter Your Study Material
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder='Paste your notes, textbook content, or any study material here...'
                className='w-full h-32 sm:h-40 p-3 sm:p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base'
              />
              <div className='mt-4 flex justify-center'>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || remainingFlashcards <= 0}
                  className='px-6 py-2 sm:px-8 sm:py-2 text-sm sm:text-base'
                >
                  {loading ? 'Generating...' : 'Generate Flashcards'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {flashcards.length > 0 && (
          <div>
            <div className='flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 sm:gap-0'>
              <h2 className='text-2xl font-semibold sm:text-3xl'>
                Generated Flashcards
              </h2>
              <div className='flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto'>
                <input
                  type='text'
                  value={setName}
                  onChange={e => setSetName(e.target.value)}
                  placeholder='Name your flashcard set...'
                  className='w-full sm:w-64 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base'
                />
                <Button
                  onClick={handleSaveFlashcards}
                  disabled={saving || !user}
                  variant='outline'
                  className='w-full sm:w-auto px-4 py-2 text-sm sm:text-base'
                >
                  {saving ? 'Saving...' : 'Save Flashcards'}
                </Button>
              </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
              {flashcards.map((flashcard, index) => (
                <div
                  key={index}
                  className='relative h-40 sm:h-48 cursor-pointer'
                  onClick={() => handleCardClick(index)}
                  style={{ perspective: '1000px' }}
                >
                  <div
                    className={`relative w-full h-full transition-transform duration-600 ${
                      flipped[index] ? 'rotate-y-180' : ''
                    }`}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div
                      className='absolute inset-0 w-full h-full'
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <Card className='w-full h-full'>
                        <CardContent className='flex items-center justify-center h-full p-2 sm:p-4'>
                          <div className='text-center'>
                            <p className='text-xs sm:text-sm text-gray-500 mb-1'>
                              Question
                            </p>
                            <p className='text-base sm:text-lg'>
                              {flashcard.front}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div
                      className='absolute inset-0 w-full h-full'
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                      }}
                    >
                      <Card className='w-full h-full bg-blue-50 dark:bg-blue-900'>
                        <CardContent className='flex items-center justify-center h-full p-2 sm:p-4'>
                          <div className='text-center'>
                            <p className='text-xs sm:text-sm text-gray-500 mb-1'>
                              Answer
                            </p>
                            <p className='text-base sm:text-lg'>
                              {flashcard.back}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>

      <FirebaseConnectionStatus />
    </div>
  )
}
