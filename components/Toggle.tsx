'use client'

import { useGameStore } from '../store/useGameStore'

interface ToggleProps {
  label: string
  setting: 'sound' | 'animations' | 'contrast'
  description?: string
  className?: string
}

export default function Toggle({ label, setting, description, className = '' }: ToggleProps) {
  const { 
    soundEnabled, 
    reduceAnimations, 
    highContrast, 
    toggleSound, 
    toggleAnimations, 
    toggleContrast 
  } = useGameStore()

  const getValue = () => {
    switch (setting) {
      case 'sound': return soundEnabled
      case 'animations': return reduceAnimations
      case 'contrast': return highContrast
      default: return false
    }
  }

  const handleToggle = (e?: React.MouseEvent | React.TouchEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    
    switch (setting) {
      case 'sound': return toggleSound()
      case 'animations': return toggleAnimations()
      case 'contrast': return toggleContrast()
    }
  }

  const isChecked = getValue()

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex flex-col">
        <label className="text-sm font-medium text-white cursor-pointer">
          {label}
        </label>
        {description && (
          <span className="text-xs text-gray-400 mt-1">
            {description}
          </span>
        )}
      </div>
      <div 
        className="toggle-switch" 
        onClick={handleToggle}
        onTouchEnd={handleToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleToggle()
          }
        }}
      >
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleToggle}
          className="sr-only"
          aria-label={`${label} ${isChecked ? 'activé' : 'désactivé'}`}
        />
        <span className={`toggle-slider ${isChecked ? 'toggle-slider-active' : ''}`} />
      </div>
    </div>
  )
}
