export const initAnalytics = () => {
  // Analytics simple - peut être étendu plus tard
  console.log('Analytics initialized')
}

export const trackGameStart = () => {
  console.log('Game started')
}

export const trackGameEnd = (score: number, duration: number, maxCombo: number) => {
  console.log('Game ended:', { score, duration, maxCombo })
}

export const trackGameScore = (score: number, timeLeft: number) => {
  // Tracking du score - peut être étendu plus tard
}

export const trackSettingsChange = (setting: string, value: boolean) => {
  console.log('Setting changed:', setting, value)
}
