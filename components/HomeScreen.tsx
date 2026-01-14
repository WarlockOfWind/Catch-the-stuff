'use client'

import Image from 'next/image'
import { useGameStore } from '../store/useGameStore'
import Toggle from './Toggle'

export default function HomeScreen() {
  const { start, highContrast } = useGameStore()

  const handleStart = () => {
    start()
  }

  return (
    <div className={`game-container ${highContrast ? 'high-contrast' : ''}`}>
      <div className="flex flex-col items-center justify-center min-h-screen p-6 max-w-md mx-auto">
        {/* Logos PromptConsulting et Catch the Stuff */}
        <div className="mb-8 text-center">
          {/* Logo PromptConsulting - Plus petit en haut */}
          <div className="mb-4">
            <Image 
              src="/logo.webp" 
              alt="PromptConsulting" 
              width={100}
              height={50}
              className="w-24 h-auto mx-auto opacity-90"
              priority
            />
          </div>
          
          {/* Logo Catch the Stuff - Principal */}
          <div className="mb-6">
            <Image 
              src="/logo.png" 
              alt="Catch the Stuff - PromptConsulting" 
              width={192}
              height={192}
              className="w-48 h-auto mx-auto"
              priority
            />
          </div>
          
          <h1 className="text-3xl font-bold text-prompt-orange mb-2">
            PromptConsulting
          </h1>
          <div className="w-16 h-1 bg-prompt-orange mx-auto mb-4"></div>
        </div>

        {/* Instructions */}
        <div className="text-center mb-8">
          <p className="text-lg text-gray-300 mb-4">
            Attrapez les <span className="text-green-400 font-semibold">objets</span> et évitez les <span className="text-red-400 font-semibold">bombes</span>
          </p>
          <p className="text-sm text-gray-400 mb-2">
            Attrapez un <span className="text-blue-400 font-semibold">ordinateur</span> pour découvrir notre site
          </p>
          <p className="text-sm text-gray-400">
            Utilisez les flèches du clavier, la souris ou glissez votre doigt
          </p>
        </div>

        {/* Bouton Jouer */}
        <button
          onClick={handleStart}
          className="btn-primary text-xl px-12 py-4 mb-8 focus:outline-none focus:ring-4 focus:ring-prompt-orange focus:ring-opacity-50"
          aria-label="Commencer le jeu"
        >
          🎮 Jouer
        </button>

        {/* Options */}
        <div className="w-full space-y-4 mb-6">
          <Toggle
            label="Son"
            setting="sound"
            description="Effets sonores"
            className="p-3 bg-prompt-gray bg-opacity-50 rounded-lg"
          />
          
          <Toggle
            label="Réduire les animations"
            setting="animations"
            description="Désactive les effets visuels"
            className="p-3 bg-prompt-gray bg-opacity-50 rounded-lg"
          />
          
          <Toggle
            label="Contraste renforcé"
            setting="contrast"
            description="Améliore la lisibilité"
            className="p-3 bg-prompt-gray bg-opacity-50 rounded-lg"
          />
        </div>

        {/* Informations de confidentialité */}
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">
            Mesure d&apos;audience sans cookies
          </p>
          <a
            href="https://promptconsulting.fr/privacy"
            className="text-xs text-prompt-orange hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Infos & confidentialité
          </a>
        </div>
      </div>
    </div>
  )
}
