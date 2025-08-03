'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import LandingPage from '@/app/components/Landing/page'

export default function Home() {
  const router = useRouter()

  const handlePlanSelect = (plan: string) => {
    console.log('Selected plan:', plan)
    // Handle plan selection logic here
  }

  const handleGetStarted = () => {
    router.push('/auth/login')
  }

  return <LandingPage onPlanSelect={handlePlanSelect} onGetStarted={handleGetStarted} />
} 