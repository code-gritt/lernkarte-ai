'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import databaseOperations from '@/server/actions/databaseOperations'

interface Flashcard {
  front: string
  back: string
}

interface FlashcardSet {
  id?: string
  name: string
  flashcards: Flashcard[]
  userId: string
  createdAt?: string
}

export default function FlashcardPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()

  const setId = searchParams.get('id')

  useEffect(() => {
    async function getFlashcardSet() {
      if (!setId || !user) return

      try {
        const rawData = await databaseOperations.getFlashcardSet(setId)

        if (rawData.userId === user.id) {
          const data: FlashcardSet = {
            id: rawData.id,
            name: rawData.name,
            flashcards: rawData.flashcards as Flashcard[],
            userId: rawData.userId,
            createdAt: rawData.createdAt,
          }
          setFlashcardSet(data)
        } else {
          alert('You do not have permission to view this flashcard set.')
          router.push('/flashcards')
        }
      } catch (error: any) {
        console.error('Error fetching flashcard set:', error)
        alert('Error loading flashcard set.')
        router.push('/flashcards')
      } finally {
        setLoading(false)
      }
    }

    if (isSignedIn && isLoaded) {
      getFlashcardSet()
    }
  }, [user, setId, isSignedIn, isLoaded, router])

  const handleCardClick = () => setFlipped(!flipped)
  const handleNextCard = () => {
    if (flashcardSet && currentCardIndex < flashcardSet.flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setFlipped(false)
    }
  }
  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
      setFlipped(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className='container mx-auto px-4 py-8 text-center'>Loading...</div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className='container mx-auto px-4 py-8 text-center'>
        <h1 className='text-3xl font-bold mb-4'>
          Please sign in to view flashcards
        </h1>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-4xl mx-auto'>
        <Button
          variant='ghost'
          onClick={() => router.push('/flashcards')}
          className='mb-6 flex items-center gap-2'
        >
          <ArrowLeft className='w-4 h-4' /> Back to Saved Flashcards
        </Button>

        <h1 className='text-3xl font-bold mb-8'>
          {flashcardSet?.name || 'Flashcards'}
        </h1>

        {!flashcardSet || flashcardSet.flashcards.length === 0 ? (
          <div className='text-center py-12 text-xl text-gray-600'>
            No flashcards found
          </div>
        ) : (
          <div className='space-y-6'>
            <div className='text-center'>
              <p className='text-sm text-gray-600 mb-2'>
                Card {currentCardIndex + 1} of {flashcardSet.flashcards.length}
              </p>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                  style={{
                    width: `${((currentCardIndex + 1) / flashcardSet.flashcards.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className='flex justify-center'>
              <div
                className='relative w-full max-w-md h-64 cursor-pointer'
                onClick={handleCardClick}
                style={{ perspective: '1000px' }}
              >
                <div
                  className='relative w-full h-full transition-transform duration-600'
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  <div
                    className='absolute inset-0 w-full h-full'
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <Card className='w-full h-full bg-blue-50 border-2 border-blue-200'>
                      <CardContent className='flex items-center justify-center h-full p-6'>
                        <div className='text-center'>
                          <p className='text-sm text-blue-600 mb-2 font-medium'>
                            Question
                          </p>
                          <p className='text-lg font-medium text-gray-800'>
                            {flashcardSet.flashcards[currentCardIndex]?.front}
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
                    <Card className='w-full h-full bg-green-50 border-2 border-green-200'>
                      <CardContent className='flex items-center justify-center h-full p-6'>
                        <div className='text-center'>
                          <p className='text-sm text-green-600 mb-2 font-medium'>
                            Answer
                          </p>
                          <p className='text-lg font-medium text-gray-800'>
                            {flashcardSet.flashcards[currentCardIndex]?.back}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>

            <div className='text-center'>
              <p className='text-sm text-gray-600 mb-4'>
                Click the card to flip it and see the answer
              </p>
            </div>

            <div className='flex justify-center space-x-4'>
              <Button
                onClick={handlePrevCard}
                disabled={currentCardIndex === 0}
                variant='outline'
                size='lg'
              >
                Previous
              </Button>
              <Button
                onClick={handleNextCard}
                disabled={
                  currentCardIndex === flashcardSet.flashcards.length - 1
                }
                variant='default'
                size='lg'
              >
                Next
              </Button>
            </div>

            {currentCardIndex === flashcardSet.flashcards.length - 1 && (
              <div className='text-center mt-8 p-6 bg-green-50 rounded-lg'>
                <h3 className='text-lg font-semibold text-green-800 mb-2'>
                  🎉 Study Session Complete!
                </h3>
                <p className='text-green-700 mb-4'>
                  You've reviewed all cards in this set.
                </p>
                <div className='space-x-4'>
                  <Button
                    onClick={() => {
                      setCurrentCardIndex(0)
                      setFlipped(false)
                    }}
                    variant='outline'
                  >
                    Study Again
                  </Button>
                  <Button onClick={() => router.push('/flashcards')}>
                    Back to Sets
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
