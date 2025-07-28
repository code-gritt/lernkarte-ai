import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Footer from '@/components/Footer'
import { ThemeProvider } from '@/components/theme-provider'
import Navbar from '@/components/Navbar'
import { Analytics } from '@vercel/analytics/next'
import { ClerkProvider } from '@clerk/nextjs'

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'LernKarte AI',
  description:
    'Generate intelligent flashcards instantly using AI. Learn faster and smarter with LernKarte AI.',
  keywords: [
    'AI Flashcards',
    'Study Tool',
    'Flashcard Generator',
    'AI Learning',
    'Smart Study',
    'Education Technology',
    'Study Cards',
    'Memory Training',
    'Learning App',
    'Study Assistant',
    'AI Study Tool',
    'Educational SaaS',
  ],
  openGraph: {
    title: 'LernKarte AI',
    description:
      'Generate intelligent flashcards instantly using AI. Learn faster and smarter with LernKarte AI.',
    siteName: 'LernKarte AI',
    images: [
      {
        url: 'https://i.postimg.cc/65jX93Ct/Screenshot-2025-07-02-224028.png',
        width: 1200,
        height: 630,
        alt: 'LernKarte AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LernKarte AI',
    description:
      'Generate intelligent flashcards instantly using AI. Learn faster and smarter with LernKarte AI.',
    images: ['https://i.postimg.cc/65jX93Ct/Screenshot-2025-07-02-224028.png'],
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      publishableKey={'pk_test_Zm9uZC1wYXJyb3QtNDkuY2xlcmsuYWNjb3VudHMuZGV2JA'}
    >
      <html lang='en' suppressHydrationWarning className={geist.variable}>
        <body className='font-sans antialiased' suppressHydrationWarning>
          <ThemeProvider
            attribute='class'
            defaultTheme='light'
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />

            <main className='min-h-screen container mx-auto px-4'>
              {children}
              <Analytics />
            </main>
            <Footer />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
