import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { useGenerationStore } from '@/store/generationStore'

// In-memory rate limiting
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_WINDOW = 60 * 1000
const MAX_REQUESTS_PER_WINDOW = 2

function isRateLimited(clientIP: string): boolean {
  const now = Date.now()
  const clientRequests = rateLimitMap.get(clientIP) || []

  const recentRequests = clientRequests.filter(
    (timestamp: number) => now - timestamp < RATE_LIMIT_WINDOW
  )

  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    return true
  }

  recentRequests.push(now)
  rateLimitMap.set(clientIP, recentRequests)

  return false
}

const systemPrompt = `
You are a flashcard creator. Your task is to generate concise and effective flashcards based on the given topic or content. Follow these guidelines:
1. Create clear and concise questions for the front of the flashcard.
2. Provide accurate and informative answers for the back of the flashcard.
3. Ensure that each flashcard focuses on a single concept or piece of information.
4. Use simple language to make the flashcards accessible to a wide range of learners.
5. Include a variety of question types, such as definitions, examples, comparisons, and applications.
6. Avoid overly complex or ambiguous phrasing in both questions and answers.
7. When appropriate, use mnemonics or memory aids to help reinforce the information.
8. Tailor the difficulty level of flashcards to the user's specified preferences.
9. If given a body of text, extract the most important and relevant information for the flashcards.
10. Aim to create a balanced set of flashcards that covers the topic comprehensively.
11. Only generate 10 flashcards.
You should return in the following JSON format:
{
  "flashcards": [
    {
      "front": "str",
      "back": "str"
    }
  ]
}
`

async function generateFlashcards(prompt: string) {
  try {
    const apiKey = 'AIzaSyCrFOJs7a9eRY4kc2U6efgERkKpLRH_pqs'
    if (!apiKey) {
      console.error('Missing GEMINI_API_KEY environment variable')
      throw new Error(
        'API key is not configured. Please check server configuration.'
      )
    }

    console.log(
      'Generating flashcards for prompt:',
      prompt.substring(0, 100) + '...'
    )

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite-preview-06-17',
    })

    const fullPrompt = `${systemPrompt}\n\nNow create flashcards for this content:\n\n${prompt}`

    await new Promise(resolve => setTimeout(resolve, 1000)) // Small delay for rate limiting

    const result = await model.generateContent(fullPrompt)
    const text = await result.response.text()

    console.log('Raw API Response:', text)

    let cleanedText = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()

    const jsonStart = cleanedText.indexOf('{')
    const jsonEnd = cleanedText.lastIndexOf('}') + 1

    if (jsonStart !== -1 && jsonEnd > jsonStart) {
      cleanedText = cleanedText.substring(jsonStart, jsonEnd)
    }

    console.log('Cleaned text:', cleanedText)

    const flashcards = JSON.parse(cleanedText)

    if (!flashcards.flashcards || !Array.isArray(flashcards.flashcards)) {
      console.error('Invalid response format from AI:', flashcards)
      throw new Error('AI returned invalid response format')
    }

    const validFlashcards = flashcards.flashcards.filter(
      (card: any) =>
        card.front &&
        card.back &&
        typeof card.front === 'string' &&
        typeof card.back === 'string'
    )

    console.log('Generated', validFlashcards.length, 'valid flashcards')

    return validFlashcards
  } catch (error) {
    console.error('Error generating flashcards:', error)

    if (error instanceof Error && error.message.includes('quota exceeded')) {
      throw new Error('API quota exceeded. Please try again in a few minutes.')
    }

    if (error instanceof Error && error.message.includes('429')) {
      throw new Error('Too many requests. Please wait a moment and try again.')
    }

    return [
      {
        front: 'Sample Question about ' + prompt.substring(0, 50) + '...',
        back: 'This is a fallback flashcard. The AI service is temporarily unavailable. Please try again later.',
      },
      {
        front: 'What should you do if flashcard generation fails?',
        back: 'Wait a few minutes and try again. The service may be experiencing high demand or rate limits.',
      },
    ]
  }
}

export async function POST(req: Request) {
  try {
    const clientIP = 'general' // Replace with actual IP in production
    if (isRateLimited(clientIP)) {
      return NextResponse.json(
        {
          error:
            'Rate limit exceeded. Please wait a moment before generating more flashcards.',
        },
        { status: 429 }
      )
    }

    const { text } = await req.json()

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // Extract userId from headers
    const userId = req.headers.get('X-User-Id')
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      )
    }

    // Sync with Zustand store
    const { remainingFlashcards, paidTier, updateRemainingFlashcards } =
      useGenerationStore.getState()
    if (remainingFlashcards <= 0) {
      return NextResponse.json(
        {
          error: `Generation limit reached. ${paidTier ? 'You have used all 1,000 flashcards. Please renew your subscription.' : 'Please upgrade to generate more flashcards.'}`,
          upgradeRequired: !paidTier,
        },
        { status: 402 }
      )
    }

    const flashcards = await generateFlashcards(text)

    const deduction = paidTier ? flashcards.length : 1 // Deduct per flashcard for paid, per attempt for free
    const newRemaining = Math.max(0, remainingFlashcards - deduction)
    updateRemainingFlashcards(newRemaining)

    return NextResponse.json({
      flashcards,
      remainingAttempts: newRemaining,
      paidTier,
      message: `Flashcards generated! ${newRemaining} ${paidTier ? 'flashcards' : 'attempts'} remaining.`,
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
