import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import crypto from 'crypto'

const razorpay = new Razorpay({
  key_id: 'rzp_live_AZiZ00XxSHA7L2',
  key_secret: 'WHBYi9AO4NyZuadj4l50w5Wt',
})

// In-memory user data (replace with database in production)
const userData: {
  [userId: string]: { paidTier: boolean; remainingFlashcards: number }
} = {}

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await req.json()

    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', 'WHBYi9AO4NyZuadj4l50w5Wt')
      .update(body.toString())
      .digest('hex')

    const isAuthentic = expectedSignature === razorpay_signature

    if (isAuthentic) {
      // Simulate user ID (replace with actual user.id from Clerk in production)
      const userId = 'user123' // Placeholder

      // Update user data for paid tier
      userData[userId] = {
        paidTier: true,
        remainingFlashcards: 1000, // Set initial limit to 1,000 flashcards
      }

      return NextResponse.json({
        success: true,
        message:
          'Payment verified successfully. You can now generate up to 1,000 flashcards!',
      })
    } else {
      return NextResponse.json(
        { success: false, message: 'Payment verification failed' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Payment verification failed' },
      { status: 500 }
    )
  }
}
