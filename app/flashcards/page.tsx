'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import databaseOperations from '@/server/actions/databaseOperations'

interface Flashcard {
  front: string
  back: string
}

interface FlashcardSet {
  id: string
  name: string
  flashcards: Flashcard[]
  userId: string
  createdAt: string | any
}

export default function FlashcardsPage() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function getFlashcardSets() {
      if (!user) return

      try {
        console.log('Fetching flashcard sets from Firebase...')
        const rawSets = await databaseOperations.getFlashcardSets(user.id)

        // ✅ Cast each set.flashcards to Flashcard[]
        const parsedSets: FlashcardSet[] = rawSets.map((set: any) => ({
          id: set.id,
          name: set.name,
          flashcards: set.flashcards as Flashcard[],
          userId: set.userId,
          createdAt: set.createdAt,
        }))

        setFlashcardSets(parsedSets)
        console.log('Fetched', parsedSets.length, 'flashcard sets')
      } catch (error) {
        console.error('Error fetching flashcard sets:', error)

        let errorMessage = 'Failed to load flashcard sets. '
        if (error instanceof Error) {
          if (error.message.includes('permission-denied')) {
            errorMessage +=
              'Permission denied. Please check your authentication.'
          } else if (
            error.message.includes('network') ||
            error.message.includes('offline')
          ) {
            errorMessage +=
              'Network error. Please check your internet connection and try again.'
          } else {
            errorMessage += error.message
          }
        }

        setFlashcardSets([])
        alert(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    if (isSignedIn && isLoaded) {
      getFlashcardSets()
    }
  }, [user, isSignedIn, isLoaded])

  const handleDeleteSet = async (setId: string) => {
    if (confirm('Are you sure you want to delete this flashcard set?')) {
      try {
        await databaseOperations.deleteFlashcardSet(setId)
        setFlashcardSets(prev => prev.filter(set => set.id !== setId))
        console.log('Flashcard set deleted successfully')
      } catch (error) {
        console.error('Error deleting flashcard set:', error)

        let errorMessage = 'Failed to delete flashcard set. '
        if (error instanceof Error) {
          if (error.message.includes('permission-denied')) {
            errorMessage += 'Permission denied.'
          } else if (error.message.includes('network')) {
            errorMessage += 'Network error. Please try again.'
          } else {
            errorMessage += error.message
          }
        }

        alert(errorMessage)
      }
    }
  }

  const handleStudySet = (setId: string) => {
    router.push(`/flashcard?id=${setId}`)
  }

  if (!isLoaded || loading) {
    return (
      <div className='container mx-auto px-4 py-8 text-center'>
        <p>Loading...</p>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className='container mx-auto px-4 py-8 text-center'>
        <h1 className='text-3xl font-bold mb-4'>
          Please sign in to view your flashcards
        </h1>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Back Button */}
        <Button
          variant='ghost'
          onClick={() => router.push('/')}
          className='mb-6 flex items-center gap-2'
        >
          <ArrowLeft className='w-4 h-4' />
          Back to Home
        </Button>

        <h1 className='text-3xl font-bold text-center mb-8'>
          Your Flashcard Collections
        </h1>

        {flashcardSets.length === 0 ? (
          <div className='text-center py-12'>
            <p className='text-xl text-gray-600 mb-4'>
              No flashcard collections yet
            </p>
            <p className='text-gray-500 mb-6'>
              Create your first collection by generating flashcards!
            </p>
            <Button onClick={() => router.push('/generate')}>
              Generate Flashcards
            </Button>
          </div>
        ) : (
          <>
            <div className='text-center mb-6'>
              <p className='text-gray-600'>
                You have {flashcardSets.length} collection
                {flashcardSets.length > 1 ? 's' : ''} with{' '}
                {flashcardSets.reduce(
                  (sum, set) => sum + set.flashcards.length,
                  0
                )}{' '}
                total cards.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {flashcardSets.map(set => (
                <Card
                  key={set.id}
                  className='hover:shadow-lg transition-shadow duration-200 border-2 hover:border-blue-200'
                >
                  <CardHeader>
                    <CardTitle className='text-lg'>{set.name}</CardTitle>
                    <p className='text-sm text-gray-500'>
                      {set.flashcards.length} cards
                    </p>
                    <p className='text-xs text-gray-400'>
                      Created:{' '}
                      {typeof set.createdAt === 'string'
                        ? new Date(set.createdAt).toLocaleDateString()
                        : (set.createdAt?.toDate?.()?.toLocaleDateString() ??
                          'Unknown')}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className='flex space-x-2'>
                      <Button
                        onClick={() => handleStudySet(set.id)}
                        className='flex-1'
                      >
                        Study
                      </Button>
                      <Button
                        onClick={() => handleDeleteSet(set.id)}
                        variant='destructive'
                        size='sm'
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
