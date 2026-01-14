'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { useGameStore } from '../store/useGameStore'

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)
  const [imagesLoaded, setImagesLoaded] = useState(false)
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({})
  const [basketImage, setBasketImage] = useState<HTMLImageElement | null>(null)
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [basketPosition, setBasketPosition] = useState({ x: 0.5, y: 0.85 })
  const [basketAnimation, setBasketAnimation] = useState({ 
    scale: 1, 
    rotation: 0, 
    bounce: 0, 
    duration: 0,
    type: 'none' // 'catch', 'bomb', 'none'
  })
  const [audioLoaded, setAudioLoaded] = useState(false)
  const [catchAudio, setCatchAudio] = useState<HTMLAudioElement | null>(null)
  const [bombAudio, setBombAudio] = useState<HTMLAudioElement | null>(null)
  
  const { phase, score, timeLeft, entities, player, update, movePlayer, gameOver, gameOverByBomb, collectEntity, soundEnabled, reduceAnimations, highContrast } = useGameStore()

  // Fonction pour jouer les sons
  const playSound = useCallback((soundType: 'catch' | 'bomb') => {
    if (!soundEnabled || !audioLoaded) return
    
    try {
      if (soundType === 'catch' && catchAudio) {
        // Jouer le son de capture depuis le fichier WAV
        catchAudio.currentTime = 0 // Remettre au début
        catchAudio.play().catch(error => {
          console.warn('Impossible de jouer le son de capture:', error)
        })
      } else if (soundType === 'bomb' && bombAudio) {
        // Pour la bombe, on peut garder le son généré ou utiliser un autre fichier
        // Ici on génère un son court avec Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2)
        
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.2)
      }
    } catch (error) {
      console.warn('Erreur lors de la lecture du son:', error)
    }
  }, [soundEnabled, audioLoaded, catchAudio, bombAudio])

  // Fonction pour déclencher l'animation du panier améliorée
  const triggerBasketAnimation = useCallback((animationType: 'catch' | 'bomb' = 'catch') => {
    // Ne pas déclencher d'animations si elles sont désactivées
    if (reduceAnimations) return
    
    if (animationType === 'catch') {
      // Animation de capture : grossissement + rotation + rebond
      setBasketAnimation({ 
        scale: 1.4, 
        rotation: 0.1, 
        bounce: 0.3, 
        duration: 300,
        type: 'catch'
      })
      setTimeout(() => {
        setBasketAnimation({ 
          scale: 1, 
          rotation: 0, 
          bounce: 0, 
          duration: 0,
          type: 'none'
        })
      }, 300)
    } else if (animationType === 'bomb') {
      // Animation de bombe : secousse + rotation négative
      setBasketAnimation({ 
        scale: 0.9, 
        rotation: -0.2, 
        bounce: 0.1, 
        duration: 150,
        type: 'bomb'
      })
      setTimeout(() => {
        setBasketAnimation({ 
          scale: 1.1, 
          rotation: 0.1, 
          bounce: 0.2, 
          duration: 100,
          type: 'bomb'
        })
        setTimeout(() => {
          setBasketAnimation({ 
            scale: 1, 
            rotation: 0, 
            bounce: 0, 
            duration: 0,
            type: 'none'
          })
        }, 100)
      }, 150)
    }
  }, [reduceAnimations])

  // Calculer les positions du panier selon l'appareil - Position contrôlée par l'utilisateur
  const getBasketPosition = useCallback(() => {
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    
    // Taille du panier selon l'appareil - optimisé pour mobile
    let basketWidth, basketHeight, baseY
    switch (deviceType) {
      case 'mobile':
        basketWidth = windowWidth * 0.18  // Augmenté pour mobile
        basketHeight = windowHeight * 0.10  // Réduit la hauteur pour mobile
        baseY = windowHeight * 0.85
        break
      case 'tablet':
        basketWidth = windowWidth * 0.12
        basketHeight = windowHeight * 0.12
        baseY = windowHeight * 0.88
        break
      default: // desktop
        basketWidth = windowWidth * 0.1
        basketHeight = windowHeight * 0.10
        baseY = windowHeight * 0.9
        break
    }
    
    // Position X contrôlée par l'utilisateur (0-1, convertie en pixels)
    const x = basketPosition.x * (windowWidth - basketWidth)
    const y = baseY // Position Y fixe selon l'appareil
    
    // Appliquer les animations améliorées
    const animatedWidth = basketWidth * basketAnimation.scale
    const animatedHeight = basketHeight * basketAnimation.scale
    const animatedX = x - (animatedWidth - basketWidth) / 2
    const animatedY = y - (animatedHeight - basketHeight) / 2 - (basketAnimation.bounce * basketHeight)
    
    return { 
      x: animatedX, 
      y: animatedY, 
      width: animatedWidth, 
      height: animatedHeight,
      rotation: basketAnimation.rotation,
      type: basketAnimation.type
    }
  }, [deviceType, basketPosition.x, basketAnimation])

  // Détecter le type d'appareil
  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth
      if (width <= 768) {
        setDeviceType('mobile')
      } else if (width <= 1024) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }
    
    detectDevice()
    window.addEventListener('resize', detectDevice)
    return () => window.removeEventListener('resize', detectDevice)
  }, [])

  // Charger les images
  useEffect(() => {
    const loadImages = async () => {
      const imageTypes = [
        'client', 'coffee', 'pizza', 'lemon', 'pear', 'pineapple', 
        'plum', 'champagne', 'computer', 'flower', 'bomb'
      ]
      
      const loadPromises = imageTypes.map(type => 
        new Promise<void>((resolve) => {
          const img = new Image()
          img.onload = () => {
            setImages(prev => ({ ...prev, [type]: img }))
            resolve()
          }
          img.src = `/${type}.svg`
        })
      )
      
      // Charger l'image du panier séparément
      const basketImg = new Image()
      const basketPromise = new Promise<void>((resolve) => {
    basketImg.onload = () => {
      setBasketImage(basketImg)
          resolve()
    }
    basketImg.src = '/basket.svg'
      })
    
      await Promise.all([...loadPromises, basketPromise])
      setImagesLoaded(true)
    }
    
    loadImages()
  }, [])

  // Charger les fichiers audio
  useEffect(() => {
    const loadAudio = async () => {
      try {
        // Charger le son de capture (utilise le fichier catch-the-stuff.wav)
        const catchSound = new Audio('/catch-the-stuff.wav')
        catchSound.preload = 'auto'
        catchSound.volume = 0.3 // Volume réduit pour éviter d'être trop fort
        
        // Charger le son de bombe (généré avec Web Audio API pour un son court)
        const bombSound = new Audio()
        bombSound.preload = 'auto'
        bombSound.volume = 0.5
        
        // Attendre que les sons soient prêts
        await Promise.all([
          new Promise<void>((resolve) => {
            catchSound.addEventListener('canplaythrough', () => resolve(), { once: true })
            catchSound.addEventListener('error', () => {
              console.warn('Impossible de charger le son de capture, utilisation du fallback')
              resolve()
            })
          }),
          new Promise<void>((resolve) => {
            bombSound.addEventListener('canplaythrough', () => resolve(), { once: true })
            bombSound.addEventListener('error', () => resolve())
          })
        ])
        
        setCatchAudio(catchSound)
        setBombAudio(bombSound)
        setAudioLoaded(true)
        console.log('Audio chargé avec succès')
      } catch (error) {
        console.error('Erreur lors du chargement de l\'audio:', error)
        setAudioLoaded(true) // Continuer même si l'audio ne charge pas
      }
    }

    loadAudio()
  }, [])

  // Boucle de jeu
  const gameLoop = useCallback((currentTime: number) => {
    const deltaTime = currentTime - lastTimeRef.current
    lastTimeRef.current = currentTime

    console.log('Game loop - Phase:', phase, 'DeltaTime:', deltaTime)
    update(deltaTime)

    // Pendant le countdown, dessiner seulement le panier
    if (phase === 'countdown') {
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          // Effacer le canvas
          ctx.fillStyle = '#1A1A1A'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          
          // Dessiner le panier pendant le countdown - Position absolue par rapport à la fenêtre
          const basketPos = getBasketPosition()
          const basketX = basketPos.x
          const basketY = basketPos.y
          const basketWidth = basketPos.width
          const basketHeight = basketPos.height
          
          console.log('Countdown - Device:', deviceType, 'Window:', window.innerWidth, 'x', window.innerHeight)
          console.log('Countdown - Canvas:', canvas.width, 'x', canvas.height)
          console.log('Countdown - Player:', player.x, player.y, player.width, player.height)
          console.log('Countdown - Basket pos (abs):', basketX, basketY, basketWidth, basketHeight)
          
          // Dessiner le panier avec le SVG
          if (basketImage && imagesLoaded) {
            ctx.drawImage(basketImage, basketX, basketY, basketWidth, basketHeight)
          } else {
            // Fallback si l'image n'est pas chargée
            ctx.fillStyle = '#FF6B35'
            ctx.fillRect(basketX, basketY, basketWidth, basketHeight)
            ctx.strokeStyle = '#FFFFFF'
            ctx.lineWidth = 3
            ctx.strokeRect(basketX, basketY, basketWidth, basketHeight)
            
            ctx.fillStyle = '#FFFFFF'
            const fontSize = deviceType === 'mobile' ? 20 : deviceType === 'tablet' ? 18 : 16
            ctx.font = `bold ${fontSize}px Arial`
            ctx.fillText('PANIER', basketX + 5, basketY + basketHeight/2)
          }
          
          // Dessiner un point de debug au centre
          ctx.fillStyle = '#FF0000'
          ctx.beginPath()
          ctx.arc(canvas.width/2, canvas.height/2, 5, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      
      // Continuer la boucle
      if (phase === 'countdown' || phase === 'playing') {
        animationRef.current = requestAnimationFrame(gameLoop)
      }
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Effacer le canvas
    ctx.fillStyle = '#1A1A1A'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Vérifier les collisions et déclencher l'animation
    const collisionBasketPos = getBasketPosition()
    entities.forEach(entity => {
      // Ne pas vérifier les collisions pour les objets déjà collectés
      if (entity.collected) return
      
      const entityX = entity.x * canvas.width
      const entityY = entity.y * canvas.height
      // Taille des objets ajustée selon l'appareil
      const sizeMultiplier = deviceType === 'mobile' ? 1.3 : deviceType === 'tablet' ? 1.1 : 1.0
      const entitySize = entity.size * canvas.width * sizeMultiplier
      
      // Vérifier la collision avec le panier
      const distance = Math.sqrt(
        Math.pow(entityX - (collisionBasketPos.x + collisionBasketPos.width / 2), 2) +
        Math.pow(entityY - (collisionBasketPos.y + collisionBasketPos.height / 2), 2)
      )
      
      if (distance < (entitySize + Math.min(collisionBasketPos.width, collisionBasketPos.height)) / 2) {
        // Collision détectée - collecter l'entité et déclencher l'animation
        const goodItems = ['client', 'coffee', 'pizza', 'lemon', 'pear', 'pineapple', 'plum', 'champagne', 'computer', 'flower']
        
        if (goodItems.includes(entity.type)) {
          // Objet positif - animation de capture
          triggerBasketAnimation('catch')
          collectEntity(entity.id)
          
          // Effet sonore si activé
          playSound('catch')
        } else if (entity.type === 'bomb') {
          // Bombe - animation de secousse puis GAME OVER
          triggerBasketAnimation('bomb')
          collectEntity(entity.id)
          
          // Effet sonore si activé
          playSound('bomb')
          
          // Délai pour laisser l'animation se jouer avant le Game Over
          setTimeout(() => {
            gameOver(true)
          }, 200)
        }
      }
    })

    // Dessiner les entités
    entities.forEach(entity => {
      // Ne pas dessiner les objets collectés
      if (entity.collected) return
      
      const x = entity.x * canvas.width
      const y = entity.y * canvas.height
      // Taille des objets ajustée selon l'appareil
      const sizeMultiplier = deviceType === 'mobile' ? 1.3 : deviceType === 'tablet' ? 1.1 : 1.0
      const size = entity.size * canvas.width * sizeMultiplier
      
      // Sauvegarder le contexte
      ctx.save()
      
      // Appliquer la rotation et la position
      ctx.translate(x, y)
      ctx.rotate(entity.rotation)
      
      // Dessiner l'image d'abord (pour toutes les entités)
      if (images[entity.type] && imagesLoaded) {
        // Dessiner l'image avec rotation
        ctx.drawImage(
          images[entity.type],
          -size / 2,
          -size / 2,
          size,
          size
        )
      } else {
        // Fallback : dessiner des cercles si les images ne sont pas chargées
        const goodItems = ['client', 'coffee', 'pizza', 'lemon', 'pear', 'pineapple', 'plum', 'champagne', 'computer', 'flower']
        ctx.fillStyle = goodItems.includes(entity.type) ? '#4CAF50' : '#F44336'
        ctx.beginPath()
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2)
        ctx.fill()
      }
      
      // Effet spécial pour les bombes (appliqué APRÈS l'image)
      if (entity.type === 'bomb') {
        const time = Date.now() / 200 // Vitesse de clignotement
        const blinkIntensity = Math.abs(Math.sin(time)) * 0.5 + 0.5
        
        // Effet de particules autour de la bombe
        ctx.save()
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2 + time * 0.5
          const radius = size * 0.8 + Math.sin(time * 2 + i) * size * 0.2
          const particleX = Math.cos(angle) * radius
          const particleY = Math.sin(angle) * radius
          
          ctx.fillStyle = `rgba(255, 0, 0, ${blinkIntensity * 0.6})`
          ctx.beginPath()
          ctx.arc(particleX, particleY, size * 0.05, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
        
        // Appliquer l'effet de clignotement rouge uniquement sur les pixels existants
        // Utiliser 'overlay' pour éviter de colorer le fond transparent tout en gardant l'effet de clignotement
        if (images[entity.type] && imagesLoaded) {
          ctx.globalCompositeOperation = 'overlay'
          ctx.fillStyle = `rgba(255, 0, 0, ${blinkIntensity * 0.25})`
          ctx.fillRect(-size / 2, -size / 2, size, size)
          ctx.globalCompositeOperation = 'source-over'
        }
      }
      
      // Restaurer le contexte
    ctx.restore()
    })

    // Dessiner le joueur (panier) - Position absolue par rapport à la fenêtre
    const basketPos = getBasketPosition()
    const basketX = basketPos.x
    const basketY = basketPos.y
    const basketWidth = basketPos.width
    const basketHeight = basketPos.height
    const basketRotation = basketPos.rotation
    const animationType = basketPos.type
    
    console.log('Playing - Device:', deviceType, 'Window:', window.innerWidth, 'x', window.innerHeight)
    console.log('Playing - Canvas:', canvas.width, 'x', canvas.height)
    console.log('Playing - Basket pos (abs):', basketX, basketY, basketWidth, basketHeight)
    
    // Sauvegarder le contexte pour la rotation
    ctx.save()

    // Appliquer la rotation autour du centre du panier
    ctx.translate(basketX + basketWidth / 2, basketY + basketHeight / 2)
    ctx.rotate(basketRotation)
    
    // Appliquer les effets visuels selon le type d'animation
    if (animationType === 'catch') {
      // Effet de brillance pour les captures
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, basketWidth / 2)
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = gradient
      ctx.fillRect(-basketWidth / 2, -basketHeight / 2, basketWidth, basketHeight)
    } else if (animationType === 'bomb') {
      // Effet de secousse rouge pour les bombes
      ctx.shadowColor = 'rgba(255, 0, 0, 0.5)'
      ctx.shadowBlur = 10
    }
    
    // Dessiner le panier avec le SVG
    if (basketImage && imagesLoaded) {
      ctx.drawImage(basketImage, -basketWidth / 2, -basketHeight / 2, basketWidth, basketHeight)
    } else {
      // Fallback si l'image n'est pas chargée
      ctx.fillStyle = animationType === 'bomb' ? '#FF6B6B' : '#FF8C00' // Rouge pour bombe, orange pour capture
      ctx.fillRect(-basketWidth / 2, -basketHeight / 2, basketWidth, basketHeight)
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 3
      ctx.strokeRect(-basketWidth / 2, -basketHeight / 2, basketWidth, basketHeight)
      
      ctx.fillStyle = '#FFFFFF'
      const fontSize = deviceType === 'mobile' ? 20 : deviceType === 'tablet' ? 18 : 16
      ctx.font = `bold ${fontSize}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('PANIER', 0, 0)
    }

    // Restaurer le contexte
    ctx.restore()
    
    // Dessiner un point de debug au centre
    ctx.fillStyle = '#FF0000'
    ctx.beginPath()
    ctx.arc(canvas.width/2, canvas.height/2, 5, 0, Math.PI * 2)
    ctx.fill()

  // Dessiner le HUD amélioré avec style Prompt Consulting
    const hudPadding = deviceType === 'mobile' ? 20 : deviceType === 'tablet' ? 16 : 12
    const hudFontSize = deviceType === 'mobile' ? 32 : deviceType === 'tablet' ? 28 : 24
    const hudSmallFontSize = deviceType === 'mobile' ? 20 : deviceType === 'tablet' ? 18 : 16
    
    // Dessiner le fond du score avec style Prompt Consulting
    const scoreX = hudPadding
    const scoreY = hudPadding
    const scoreWidth = deviceType === 'mobile' ? 200 : deviceType === 'tablet' ? 180 : 160
    const scoreHeight = deviceType === 'mobile' ? 90 : deviceType === 'tablet' ? 80 : 70
    
    // Fond avec gradient Prompt Consulting
    const scoreGradient = ctx.createLinearGradient(scoreX, scoreY, scoreX, scoreY + scoreHeight)
    scoreGradient.addColorStop(0, 'rgba(45, 45, 45, 0.9)') // prompt-gray avec transparence
    scoreGradient.addColorStop(0.5, 'rgba(26, 26, 26, 0.8)') // prompt-dark
    scoreGradient.addColorStop(1, 'rgba(45, 45, 45, 0.7)')
    
    ctx.fillStyle = scoreGradient
    ctx.fillRect(scoreX, scoreY, scoreWidth, scoreHeight)
    
    // Bordure avec couleur Prompt Consulting
    ctx.strokeStyle = '#FF6B35' // prompt-orange
    ctx.lineWidth = 3
    ctx.strokeRect(scoreX, scoreY, scoreWidth, scoreHeight)
    
    // Ligne décorative comme dans HomeScreen
    const lineY = scoreY + scoreHeight - 8
    ctx.fillStyle = '#FF6B35'
    ctx.fillRect(scoreX + 15, lineY, scoreWidth - 30, 3)
    
    // Icône de score (étoile)
    const iconSize = deviceType === 'mobile' ? 24 : deviceType === 'tablet' ? 22 : 20
    const iconX = scoreX + 15
    const iconY = scoreY + 12
    
    ctx.fillStyle = '#FF6B35'
    ctx.font = `${iconSize}px Arial`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText('⭐', iconX, iconY)
    
    // Texte "SCORE" avec style Prompt Consulting
    ctx.fillStyle = '#FFFFFF'
    ctx.font = `bold ${hudSmallFontSize}px Inter, Arial`
    ctx.fillText('SCORE', iconX + iconSize + 8, iconY + 2)
    
    // Valeur du score avec couleur Prompt Consulting et effet de brillance
    ctx.shadowColor = 'rgba(255, 107, 53, 0.5)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    
    ctx.fillStyle = '#FF6B35' // prompt-orange
    ctx.font = `bold ${hudFontSize}px Inter, Arial`
    ctx.fillText(score.toString(), scoreX + 15, scoreY + 35)
    
    // Reset des ombres
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    
    // Dessiner le timer avec style Prompt Consulting
    const timerX = canvas.width - hudPadding - (deviceType === 'mobile' ? 140 : deviceType === 'tablet' ? 120 : 100)
    const timerY = hudPadding
    const timerWidth = deviceType === 'mobile' ? 120 : deviceType === 'tablet' ? 110 : 100
    const timerHeight = deviceType === 'mobile' ? 90 : deviceType === 'tablet' ? 80 : 70
    
    // Fond du timer avec gradient dynamique
    const timerGradient = ctx.createLinearGradient(timerX, timerY, timerX, timerY + timerHeight)
    const seconds = Math.ceil(timeLeft / 1000)
    let timeColor, timeBorderColor, timeTextColor
    
    if (seconds <= 5) {
      timeColor = 'rgba(255, 0, 0, 0.3)'
      timeBorderColor = '#FF4444'
      timeTextColor = '#FF4444'
    } else if (seconds <= 10) {
      timeColor = 'rgba(255, 165, 0, 0.3)'
      timeBorderColor = '#FFA500'
      timeTextColor = '#FFA500'
    } else {
      timeColor = 'rgba(255, 107, 53, 0.3)' // prompt-orange
      timeBorderColor = '#FF6B35'
      timeTextColor = '#FF6B35'
    }
    
    timerGradient.addColorStop(0, 'rgba(45, 45, 45, 0.9)')
    timerGradient.addColorStop(0.5, timeColor)
    timerGradient.addColorStop(1, 'rgba(26, 26, 26, 0.8)')
    
    ctx.fillStyle = timerGradient
    ctx.fillRect(timerX, timerY, timerWidth, timerHeight)
    
    // Bordure du timer avec couleur dynamique
    ctx.strokeStyle = timeBorderColor
    ctx.lineWidth = 3
    ctx.strokeRect(timerX, timerY, timerWidth, timerHeight)
    
    // Ligne décorative
    ctx.fillStyle = timeBorderColor
    ctx.fillRect(timerX + 15, timerY + timerHeight - 8, timerWidth - 30, 3)
    
    // Icône de temps (horloge)
    const timerIconSize = deviceType === 'mobile' ? 24 : deviceType === 'tablet' ? 22 : 20
    const timerIconX = timerX + 15
    const timerIconY = timerY + 12
    
    ctx.fillStyle = timeTextColor
    ctx.font = `${timerIconSize}px Arial`
    ctx.fillText('⏱️', timerIconX, timerIconY)
    
    // Texte "TIME" 
    ctx.fillStyle = '#FFFFFF'
    ctx.font = `bold ${hudSmallFontSize}px Inter, Arial`
    ctx.fillText('TIME', timerIconX + timerIconSize + 8, timerIconY + 2)
    
    // Valeur du temps avec couleur dynamique
    ctx.fillStyle = timeTextColor
    ctx.font = `bold ${hudFontSize}px Inter, Arial`
    ctx.fillText(`${seconds}s`, timerX + 15, timerY + 35)
    
    // Effet de pulsation pour le temps critique
    if (seconds <= 5) {
      const pulseIntensity = Math.sin(Date.now() * 0.01) * 0.3 + 0.7
      ctx.fillStyle = `rgba(255, 0, 0, ${pulseIntensity * 0.2})`
      ctx.fillRect(timerX, timerY, timerWidth, timerHeight)
    }

    // Continuer la boucle
    if (phase === 'playing') {
      animationRef.current = requestAnimationFrame(gameLoop)
    }
  }, [phase, score, timeLeft, entities, player, update, images, imagesLoaded, basketImage, deviceType, triggerBasketAnimation, collectEntity, gameOver, getBasketPosition, playSound])

  // Démarrer/arrêter la boucle de jeu
  useEffect(() => {
    if (phase === 'countdown' || phase === 'playing') {
      lastTimeRef.current = performance.now()
      animationRef.current = requestAnimationFrame(gameLoop)
      } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [phase, gameLoop])

  // Gestion des événements de souris/tactile
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (phase !== 'playing' && phase !== 'countdown') return
    
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    setBasketPosition(prev => ({ 
      ...prev, 
      x: Math.max(0, Math.min(1, x)) 
    }))
  }, [phase])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (phase !== 'playing' && phase !== 'countdown') return
    
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    setBasketPosition(prev => ({ 
      ...prev, 
      x: Math.max(0, Math.min(1, x)) 
    }))
  }, [phase])

  // Gestion du clavier
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (phase !== 'playing' && phase !== 'countdown') return

    const moveStep = 0.05

    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      setBasketPosition(prev => ({ 
        ...prev, 
        x: Math.max(0, prev.x - moveStep) 
      }))
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      setBasketPosition(prev => ({ 
        ...prev, 
        x: Math.min(1, prev.x + moveStep) 
      }))
    }
  }, [phase])

    // Événements clavier
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Redimensionnement du canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      }
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  return (
    <div className={`w-full h-screen ${highContrast ? 'high-contrast' : ''}`}>
    <canvas
      ref={canvasRef}
        className="w-full h-full"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        style={{ 
          cursor: phase === 'playing' ? 'crosshair' : 'default',
          background: highContrast ? '#000000' : 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
        }}
      />
    </div>
  )
}
