import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: 'rzp_live_AZiZ00XxSHA7L2',
  key_secret: 'WHBYi9AO4NyZuadj4l50w5Wt',
})

export async function POST(req: Request) {
  try {
    const { amount } = await req.json()

    const options = {
      amount: amount || 50000, // Amount in paise, default to ₹500 monthly
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    }

    const order = await razorpay.orders.create(options)

    return NextResponse.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
    })
  } catch (error: unknown) {
    console.error('Error creating Razorpay order:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
