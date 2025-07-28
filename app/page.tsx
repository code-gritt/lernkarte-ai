import { MarqueeDemoVertical } from '@/components/sections/Testimonials'
import FAQ from '@/components/sections/FAQ'
import CTA from '@/components/sections/CTA'
import Features from '@/components/sections/Features'
import Companies from '@/components/sections/Companies'
import Hero from '@/components/sections/Hero'
import Pricing from '@/components/sections/Pricing'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LernKarte AI - Smart Flashcards Powered by AI',
  description:
    'Turn your notes into powerful flashcards with AI. LernKarte AI helps you study faster and smarter with just one click.',
}

/**
 * Home component serves as the main landing page for LernKarte AI.
 *
 * @returns {JSX.Element} The rendered Home component.
 */
export default function Home() {
  return (
    <div className='overflow-hidden'>
      <section id='home'>
        <Hero />
      </section>

      <section className='mx-auto mt-20 max-w-5xl'>
        <h2 className='section-heading'>Trusted by Learners Worldwide</h2>
        <Companies />
        <div id='features'></div>
      </section>

      <section className='mx-auto mt-20 max-w-7xl'>
        <h2 className='section-heading'>Why Use LernKarte AI?</h2>
        <p className='section-subheading'>
          Boost your learning with smart features that simplify study time.
        </p>
        <Features />
      </section>

      <section className='max-w-7xl mx-auto my-30'>
        <h2 className='section-heading'>What Users Are Saying</h2>
        <p className='section-subheading'>
          Feedback from students, educators, and lifelong learners who use
          LernKarte AI.
        </p>
        <MarqueeDemoVertical />
        <div id='pricing'></div>
      </section>

      <div className='max-w-5xl mx-auto -mt-5'>
        <h2 className='section-heading'>Plans & Pricing</h2>
        <p className='section-subheading'>
          Find the plan that works best for your study routine.
        </p>
        <Pricing />
      </div>

      <section className='max-w-3xl mx-auto mt-30 relative'>
        <h2 className='section-heading'>FAQs</h2>
        <p className='section-subheading'>
          Common questions about LernKarte AI and how it works.
        </p>
        <FAQ />
      </section>

      <section className='max-w-7xl mx-auto mt-30'>
        <CTA />
      </section>
    </div>
  )
}
