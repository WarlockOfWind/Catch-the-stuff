'use client'

import { useEffect } from 'react'
import { useGameStore } from '../store/useGameStore'
import GameCanvas from './GameCanvas'
import CountdownScreen from './CountdownScreen'

export default function GameScreen() {
  const { phase, score, maxCombo, reset, gameOverByBomb } = useGameStore()

  // Auto-redirect après 6 secondes sur l'écran de score
  useEffect(() => {
    if (phase === 'gameover') {
      const timer = setTimeout(() => {
        window.location.href = 'https://promptconsulting.fr/?utm_source=qr-card&utm_campaign=bcv2025'
      }, 6000)

      return () => clearTimeout(timer)
    }
  }, [phase])

  if (phase === 'countdown') {
    return (
      <div className="w-full h-screen">
        <CountdownScreen />
        <GameCanvas />
      </div>
    )
  }

  if (phase === 'playing') {
    return (
      <div className="w-full h-screen">
        <GameCanvas />
      </div>
    )
  }

  if (phase === 'gameover') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 max-w-md mx-auto">
        <div className="text-center mb-8">
          {gameOverByBomb ? (
            <>
              <h1 className="text-8xl font-bold text-red-500 mb-6 animate-pulse">
                GAME OVER
              </h1>
              <p className="text-2xl text-red-400 mb-4">
                💥 Bombe touchée !
              </p>
            </>
          ) : (
            <h2 className="text-4xl font-bold text-prompt-orange mb-4">
              Jeu terminé !
            </h2>
          )}
          
          <div className="text-6xl font-bold text-white mb-4">
            {score}
          </div>
          <p className="text-lg text-gray-300">
            points marqués
          </p>
          {maxCombo > 0 && (
            <p className="text-sm text-prompt-orange mt-2">
              Meilleur combo : {maxCombo}
            </p>
          )}
        </div>

        <div className="space-y-4 w-full">
          <button
            onClick={() => window.location.href = 'https://promptconsulting.fr/?utm_source=qr-card&utm_campaign=bcv2025'}
            className="btn-primary w-full text-lg py-4 focus:outline-none focus:ring-4 focus:ring-prompt-orange focus:ring-opacity-50"
          >
            Découvrir PromptConsulting
          </button>
          
          <button
            onClick={reset}
            className="btn-secondary w-full py-3 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-opacity-50"
          >
            Rejouer
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Redirection automatique dans 6 secondes...
          </p>
        </div>
      </div>
    )
  }

  return null
}
