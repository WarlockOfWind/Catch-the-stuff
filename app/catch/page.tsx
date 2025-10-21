'use client'

import { useEffect } from 'react'
import { useGameStore } from '../../store/useGameStore'
import HomeScreen from '../../components/HomeScreen'
import GameScreen from '../../components/GameScreen'
import { initAnalytics } from '../../lib/analytics'

export default function CatchPage() {
  const { phase } = useGameStore()

  // Initialiser les analytics au chargement
  useEffect(() => {
    initAnalytics()
  }, [])

  // Gérer les préférences d'accessibilité au chargement
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const prefersReducedTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)').matches
    
    if (prefersReducedMotion || prefersReducedTransparency) {
      useGameStore.getState().toggleAnimations()
    }
  }, [])

  return (
    <main className="w-full h-screen overflow-hidden">
      {phase === 'idle' ? <HomeScreen /> : <GameScreen />}
    </main>
  )
}
