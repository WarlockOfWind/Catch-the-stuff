'use client'

import { useGameStore } from '../store/useGameStore'

export default function CountdownScreen() {
  const { countdownTime } = useGameStore()
  
  const count = Math.ceil(countdownTime / 1000)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-8xl font-bold text-prompt-orange mb-4">
          {count}
        </div>
        <p className="text-xl text-white">
          Préparez-vous !
        </p>
      </div>
    </div>
  )
}