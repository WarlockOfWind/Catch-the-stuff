export type GamePhase = 'idle' | 'countdown' | 'playing' | 'gameover'

export interface Entity {
  id: string
  type: 'client' | 'bomb'
  x: number
  y: number
  size: number
}

export interface Player {
  x: number
  y: number
  width: number
  height: number
}