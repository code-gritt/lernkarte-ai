'use client'

import databaseOperations from '@/server/actions/databaseOperations'
import { useEffect, useState } from 'react'

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const testConnection = async () => {
      try {
        await databaseOperations.testConnection()
        setIsOnline(true)
      } catch (error) {
        console.error('Network test failed:', error)
        setIsOnline(false)
      }
    }

    testConnection()

    window.addEventListener('online', testConnection)
    window.addEventListener('offline', () => setIsOnline(false))

    return () => {
      window.removeEventListener('online', testConnection)
      window.removeEventListener('offline', () => setIsOnline(false))
    }
  }, [])

  if (isOnline) return null

  return (
    <div className='fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded'>
      Network connection issues detected
    </div>
  )
}
