import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'

import { eq, desc } from 'drizzle-orm'

import { flashcardSets } from '../schema'

// Initialize NeonDB connection
const sql = neon(
  'postgresql://neondb_owner:npg_CpkhJdHB42DN@ep-square-math-a97w7u5l-pooler.gwc.azure.neon.tech/lernkarte-ai-database?sslmode=require&channel_binding=require'
)
const db = drizzle(sql)

// Retry configuration
const RETRY_ATTEMPTS = 3
const RETRY_DELAY = 1000 // 1 second

// Sleep utility
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Retry wrapper for database operations
const withRetry = async <T>(
  operation: () => Promise<T>,
  retries = RETRY_ATTEMPTS
): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await operation()
      return result
    } catch (error: any) {
      console.error(`Database operation attempt ${i + 1} failed:`, error)

      const isRetryable =
        error.code === 'ECONNREFUSED' ||
        error.message.includes('network') ||
        error.message.includes('timeout')

      if (!isRetryable || i === retries - 1) {
        throw error
      }

      const delay = RETRY_DELAY * Math.pow(2, i)
      console.log(`Retrying in ${delay}ms...`)
      await sleep(delay)
    }
  }
  throw new Error('Unexpected error in withRetry')
}

export const databaseOperations = {
  // Save flashcard set
  async saveFlashcardSet(flashcardSet: {
    name: string
    flashcards: any[]
    userId: string
    createdAt?: Date
  }) {
    return withRetry(async () => {
      console.log('Attempting to save flashcard set to NeonDB...')
      const result = await db
        .insert(flashcardSets)
        .values({
          name: flashcardSet.name,
          flashcards: flashcardSet.flashcards,
          userId: flashcardSet.userId,
          createdAt: flashcardSet.createdAt || new Date(),
        })
        .returning()
      console.log('Flashcard set saved successfully with ID:', result[0].id)
      return { id: result[0].id }
    })
  },

  // Get flashcard sets for a user
  async getFlashcardSets(userId: string) {
    return withRetry(async () => {
      console.log('Attempting to fetch flashcard sets from NeonDB...')
      const sets = await db
        .select()
        .from(flashcardSets)
        .where(eq(flashcardSets.userId, userId))
        .orderBy(desc(flashcardSets.createdAt))

      console.log('Flashcard sets fetched successfully:', sets.length, 'sets')
      return sets.map(set => ({
        id: set.id.toString(),
        name: set.name,
        flashcards: set.flashcards,
        userId: set.userId,
        createdAt: set.createdAt.toISOString(),
      }))
    })
  },

  // Delete flashcard set
  async deleteFlashcardSet(setId: string) {
    return withRetry(async () => {
      console.log('Attempting to delete flashcard set:', setId)
      await db
        .delete(flashcardSets)
        .where(eq(flashcardSets.id, parseInt(setId)))
      console.log('Flashcard set deleted successfully')
    })
  },

  // Get single flashcard set
  async getFlashcardSet(setId: string) {
    return withRetry(async () => {
      console.log('Attempting to fetch flashcard set:', setId)
      const result = await db
        .select()
        .from(flashcardSets)
        .where(eq(flashcardSets.id, parseInt(setId)))
        .limit(1)

      if (result.length === 0) {
        throw new Error('Flashcard set not found')
      }

      const set = result[0]
      return {
        id: set.id.toString(),
        name: set.name,
        flashcards: set.flashcards,
        userId: set.userId,
        createdAt: set.createdAt.toISOString(),
      }
    })
  },

  // Test connection
  async testConnection() {
    return withRetry(async () => {
      console.log('Testing NeonDB connection...')
      await db.select().from(flashcardSets).limit(1)
      console.log('NeonDB connection test successful')
      return true
    }, 1)
  },
}

export default databaseOperations
