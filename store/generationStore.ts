import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Define the store interface
interface GenerationState {
  userId: string | null
  remainingFlashcards: number
  paidTier: boolean
  setUserId: (userId: string) => void
  updateRemainingFlashcards: (remaining: number) => void
  setPaidTier: (paid: boolean) => void
  reset: () => void
}

// Create the store with persistence using createJSONStorage
export const useGenerationStore = create<GenerationState>()(
  persist(
    (set, get) => ({
      userId: null,
      remainingFlashcards: 3, // Default free tier limit
      paidTier: false,
      setUserId: userId => {
        const currentUserId = get().userId
        if (currentUserId !== userId) {
          // Reset state if userId changes (new account)
          set({ userId, remainingFlashcards: 3, paidTier: false })
        } else {
          set({ userId })
        }
      },
      updateRemainingFlashcards: remaining =>
        set({ remainingFlashcards: remaining }),
      setPaidTier: paid => set({ paidTier: paid }),
      reset: () =>
        set({ userId: null, remainingFlashcards: 3, paidTier: false }),
    }),
    {
      name: 'generation-limit-storage', // Name of the item in localStorage
      storage: createJSONStorage(() => localStorage), // Custom storage with JSON handling
    }
  )
)
