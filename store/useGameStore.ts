import { create } from 'zustand'

export type GamePhase = 'idle' | 'countdown' | 'playing' | 'gameover'

export type GoodItemType = 'client' | 'coffee' | 'pizza' | 'lemon' | 'pear' | 'pineapple' | 'plum' | 'champagne' | 'computer' | 'flower'
export type BadItemType = 'bomb'

export interface Entity {
  id: string
  type: GoodItemType | BadItemType
  x: number
  y: number
  size: number
  // Propriétés d'animation
  baseX: number // Position X de base pour l'oscillation
  oscillationPhase: number // Phase de l'oscillation (0 à 2π)
  oscillationSpeed: number // Vitesse d'oscillation
  oscillationAmplitude: number // Amplitude de l'oscillation
  rotation: number // Rotation en radians
  rotationSpeed: number // Vitesse de rotation
  // État de collection
  collected: boolean // True si l'objet a été collecté
}

export interface Player {
  x: number
  y: number
  width: number
  height: number
}

interface GameState {
  // Phase du jeu
  phase: GamePhase
  
  // Score et temps
  score: number
  timeLeft: number
  countdownTime: number
  
  // Entités du jeu
  entities: Entity[]
  
  // Joueur
  player: Player
  
  // Compteurs
  combo: number
  maxCombo: number
  
  // État de fin de jeu
  gameOverByBomb: boolean
  
  // Paramètres du jeu
  soundEnabled: boolean
  reduceAnimations: boolean
  highContrast: boolean
  
  // Actions
  start: () => void
  reset: () => void
  update: (deltaTime: number) => void
  movePlayer: (x: number) => void
  gameOver: (byBomb?: boolean) => void
  collectEntity: (entityId: string) => void
  toggleSound: () => void
  toggleAnimations: () => void
  toggleContrast: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
  // État initial
  phase: 'idle',
  score: 0,
  timeLeft: 18000, // 18 secondes
  countdownTime: 3000, // 3 secondes de countdown
  entities: [],
  player: {
    x: 0.5,
    y: 0.85,
    width: 0.15,
    height: 0.08
  },
  combo: 0,
  maxCombo: 0,
  gameOverByBomb: false,
  soundEnabled: true,
  reduceAnimations: false,
  highContrast: false,

  // Actions
  start: () => {
    set({
      phase: 'countdown',
      score: 0,
      timeLeft: 18000,
      entities: [],
      player: {
        x: 0.5,
        y: 0.85,
        width: 0.15,
        height: 0.08
      },
      combo: 0,
      maxCombo: 0,
      gameOverByBomb: false
    })
  },

  reset: () => {
    set({
      phase: 'idle',
      score: 0,
      timeLeft: 18000,
      entities: [],
      player: {
        x: 0.5,
        y: 0.85,
        width: 0.15,
        height: 0.08
      },
      combo: 0,
      maxCombo: 0,
      gameOverByBomb: false
    })
  },

  gameOver: (byBomb = false) => {
    set({ phase: 'gameover', gameOverByBomb: byBomb })
  },

  collectEntity: (entityId: string) => {
    const state = get()
    const entity = state.entities.find(e => e.id === entityId)
    if (!entity || entity.collected) return

    const goodItems: GoodItemType[] = ['client', 'coffee', 'pizza', 'lemon', 'pear', 'pineapple', 'plum', 'champagne', 'computer', 'flower']
    
    // Si c'est un ordinateur, rediriger vers le site
    if (entity.type === 'computer') {
      set(state => ({
        entities: state.entities.map(e => 
          e.id === entityId ? { ...e, collected: true } : e
        )
      }))
      // Redirection vers le site PromptConsulting
      window.location.href = 'https://promptconsulting.fr/?utm_source=qr-card&utm_campaign=bcv2025'
      return
    }
    
    if (goodItems.includes(entity.type as GoodItemType)) {
      // Objet positif collecté
      set(state => ({
        score: state.score + 1,
        combo: state.combo + 1,
        maxCombo: Math.max(state.maxCombo, state.combo + 1),
        entities: state.entities.map(e => 
          e.id === entityId ? { ...e, collected: true } : e
        )
      }))
    } else if (entity.type === 'bomb') {
      // Bombe collectée - GAME OVER !
      set(state => ({
        entities: state.entities.map(e => 
          e.id === entityId ? { ...e, collected: true } : e
        )
      }))
      get().gameOver(true)
    }
  },

  toggleSound: () => {
    set(state => ({ soundEnabled: !state.soundEnabled }))
  },

  toggleAnimations: () => {
    set(state => ({ reduceAnimations: !state.reduceAnimations }))
  },

  toggleContrast: () => {
    set(state => ({ highContrast: !state.highContrast }))
  },

  movePlayer: (x: number) => {
    const state = get()
    if (state.phase !== 'playing') return
    
    set({
      player: {
        ...state.player,
        x: Math.max(0.1, Math.min(0.9, x))
      }
    })
  },

  update: (deltaTime: number) => {
    const state = get()
    console.log('Store update - Phase:', state.phase, 'CountdownTime:', state.countdownTime, 'DeltaTime:', deltaTime)
    
    // Phase countdown
    if (state.phase === 'countdown') {
      const newCountdownTime = Math.max(0, state.countdownTime - deltaTime)
      console.log('Countdown update:', newCountdownTime)
      set({ countdownTime: newCountdownTime })
      
      if (newCountdownTime <= 0) {
        console.log('Countdown finished, switching to playing')
        set({ phase: 'playing' })
      }
      return
    }

    // Phase playing
    if (state.phase === 'playing') {
      // Mettre à jour le temps
      const newTimeLeft = Math.max(0, state.timeLeft - deltaTime)
      
    if (newTimeLeft <= 0) {
        set({ phase: 'gameover' })
      return
    }

      // Générer de nouvelles entités
      const newEntities = [...state.entities]
      
      // Calculer le temps écoulé depuis le début de la partie
      const elapsedTime = 18000 - newTimeLeft
      const canSpawnComputer = elapsedTime >= 4000 // Ordinateurs seulement après 4 secondes
      
      // Augmenter le taux de spawn pour que les objets apparaissent plus tôt
      if (Math.random() < 0.05) {
        const baseX = Math.random() * 0.8 + 0.1
        
        // Définir les types d'objets positifs et négatifs
        const goodItems: GoodItemType[] = ['client', 'coffee', 'pizza', 'lemon', 'pear', 'pineapple', 'plum', 'champagne', 'flower']
        const computerItems: GoodItemType[] = ['computer']
        const badItems: BadItemType[] = ['bomb']
        
        // 80% de chance d'avoir un objet positif, 20% de chance d'avoir une bombe
        const isGoodItem = Math.random() < 0.8
        let itemType: GoodItemType | BadItemType
        
        if (isGoodItem) {
          // Si on peut spawner un ordinateur (après 8s), 10% de chance d'avoir un ordinateur
          if (canSpawnComputer && Math.random() < 0.1) {
            itemType = computerItems[0]
          } else {
            // Sinon, objet normal parmi les autres
            itemType = goodItems[Math.floor(Math.random() * goodItems.length)]
          }
        } else {
          itemType = badItems[Math.floor(Math.random() * badItems.length)]
        }
        
        const entity: Entity = {
          id: Math.random().toString(36),
          type: itemType,
          x: baseX,
          y: -0.1,
          size: 0.06, // Augmenté de 0.04 à 0.06 pour tous les appareils
          // Propriétés d'animation
          baseX: baseX,
          oscillationPhase: Math.random() * Math.PI * 2, // Phase aléatoire
          oscillationSpeed: 0.002 + Math.random() * 0.003, // Vitesse variable
          oscillationAmplitude: 0.02 + Math.random() * 0.03, // Amplitude variable
          rotation: 0,
          rotationSpeed: (Math.random() - 0.5) * 0.01, // Rotation variable
          // État de collection
          collected: false
        }
        newEntities.push(entity)
      }
      
      // Mettre à jour les entités existantes
      const updatedEntities = newEntities
        .map(entity => {
          // Mise à jour de la position Y (chute)
          const newY = entity.y + 0.0001 * deltaTime
          
          // Mise à jour de l'oscillation horizontale (désactivée si animations réduites)
          const newOscillationPhase = state.reduceAnimations ? entity.oscillationPhase : entity.oscillationPhase + entity.oscillationSpeed * deltaTime
          const oscillationX = state.reduceAnimations ? 0 : Math.sin(newOscillationPhase) * entity.oscillationAmplitude
          const newX = entity.baseX + oscillationX
          
          // Mise à jour de la rotation (désactivée si animations réduites)
          const newRotation = state.reduceAnimations ? 0 : entity.rotation + entity.rotationSpeed * deltaTime
          
          return {
            ...entity,
            x: newX,
            y: newY,
            oscillationPhase: newOscillationPhase,
            rotation: newRotation
          }
        })
        .map(entity => {
          // Les collisions sont maintenant gérées dans GameCanvas
          // Cette fonction ne fait que mettre à jour les positions
          return entity
        })
        .filter(entity => {
          // Supprimer les entités qui sont sorties de l'écran
          return entity.y <= 1.2
        })

    set({
      timeLeft: newTimeLeft,
        entities: updatedEntities
      })
    }
  }
}))
