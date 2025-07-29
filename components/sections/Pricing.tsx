'use client'

import React from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Check } from 'lucide-react'
import { useState } from 'react'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { motion } from 'framer-motion' // Updated import for framer-motion
import { BorderBeam } from '../magicui/border-beam'
import { PRICING_DISCOUNT, PRICING_PLANS } from '@/constants/pricing'
import RazorpayPayment from '@/components/RazorpayPayment'

const FeatureList = ({
  features,
}: {
  features: { text: string; included: boolean }[]
}) => (
  <ul className='text-sm text-muted-foreground mt-4'>
    {features.map((feature, index) => (
      <li key={index}>
        <Check
          className={`inline-block mr-1 size-4 ${feature.included ? 'text-green-600' : 'text-muted-foreground'}`}
        />
        <span
          className={
            feature.included
              ? 'text-primary tracking-wide dark:text-white/90'
              : 'text-muted-foreground'
          }
        >
          {feature.text}
        </span>
      </li>
    ))}
  </ul>
)

const Pricing = () => {
  const [isMonthly, setIsMonthly] = useState(true)
  const basicPlan = {
    ...PRICING_PLANS[0],
    monthlyPrice: '$10 /mo',
    yearlyPrice: '$100 /yr', // 10% discount ($8.33/mo equivalent)
  }
  const proPlan = {
    ...PRICING_PLANS[1],
    monthlyPrice: '$49 /mo',
    yearlyPrice: '$490 /yr', // 10% discount ($40.83/mo equivalent)
  }

  // Amounts in cents
  const basicAmount = isMonthly ? 1000 : 10000 // $10 monthly, $100 yearly
  const proAmount = isMonthly ? 4900 : 49000 // $49 monthly, $490 yearly

  return (
    <>
      <div className='flex items-center justify-center mb-8'>
        <div className='flex items-center justify-center gap-4 ml-20'>
          <Label htmlFor='pricing-toggle' className='font-light text-sm'>
            Monthly
          </Label>
          <Switch
            id='pricing-toggle'
            checked={!isMonthly}
            onCheckedChange={checked => setIsMonthly(!checked)}
            className='cursor-pointer'
          />
          <Label htmlFor='pricing-toggle' className='font-light text-sm'>
            Yearly
          </Label>
          <Label className='text-sm font-light bg-cyan-50 dark:text-white text-muted-foreground px-2 py-1 rounded-2xl dark:bg-teal-600/80'>
            {PRICING_DISCOUNT}
          </Label>
        </div>
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-2 mb-8 gap-20 place-items-center max-md:gap-6'>
        <Card className='relative h-fit w-[350px] max-lg:w-[300px] border rounded-2xl shadow-md lg:p-4 !gap-0'>
          <CardHeader>
            <h3 className='text-2xl font-light'>{basicPlan.name}</h3>
            <p className='text-sm text-muted-foreground'>
              {basicPlan.description}
            </p>
            <p className='text-4xl mt-4 text-center border-b border-t py-4'>
              {isMonthly ? basicPlan.monthlyPrice : basicPlan.yearlyPrice}
            </p>
          </CardHeader>
          <CardContent>
            <FeatureList features={basicPlan.features} />
          </CardContent>
          <CardFooter className='flex items-center justify-between mt-8 mb-4'>
            <RazorpayPayment
              plan='basic'
              amount={basicAmount}
              buttonText={basicPlan.buttonText}
            />
          </CardFooter>
          <motion.img
            src='/images/pricing/dollar.webp'
            alt='Dollar Icon'
            width={500}
            height={500}
            className='absolute -top-31 left-1 w-40 h-40 -z-1 max-lg:hidden'
            initial={{ y: 20 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
            whileInView={{ y: 0 }}
          />
        </Card>
        <motion.div
          initial={{ y: 30 }}
          whileInView={{ y: 0 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        >
          <Card className='relative h-full w-[350px] max-lg:w-[300px] border rounded-2xl bg-gradient-to-tr from-transparent via-teal-100/40 to-transparent dark:via-teal-500/20 shadow-xl px-4 py-8 !gap-0'>
            <CardHeader>
              <h3 className='text-2xl font-light'>{proPlan.name}</h3>
              <p className='text-sm text-muted-foreground'>
                {proPlan.description}
              </p>
              <p className='text-4xl mt-4 text-center border-b border-t py-4'>
                {isMonthly ? proPlan.monthlyPrice : proPlan.yearlyPrice}
              </p>
            </CardHeader>
            <CardContent>
              <FeatureList features={proPlan.features} />
            </CardContent>
            <CardFooter className='flex items-center justify-between mt-8 mb-4'>
              <div className='w-full'>
                <RazorpayPayment
                  plan='pro'
                  amount={proAmount}
                  buttonText={proPlan.buttonText}
                />
              </div>
            </CardFooter>
            <BorderBeam
              duration={10}
              size={400}
              className='from-transparent via-cyan-200 dark:via-cyan-600 to-transparent'
            />
            <BorderBeam
              duration={10}
              delay={5}
              size={400}
              className='from-transparent via-teal-200 dark:via-teal-600 to-transparent'
            />
          </Card>
        </motion.div>
      </div>
    </>
  )
}

export default Pricing
