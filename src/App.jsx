import React, { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stats } from '@react-three/drei'
import { Game } from './Game'
import { useStore } from './store'
import { GameLoadingScreen } from './components/GameLoadingScreen'
import { EngineWarmer } from './components/EngineWarmer'
import * as THREE from 'three'
import './index.css'

export default function App() {
  const isPlaying = useStore(state => state.isPlaying)
  const isGameOver = useStore(state => state.isGameOver)
  const score = useStore(state => state.score)
  const highScore = useStore(state => state.highScore)
  const speed = useStore(state => state.speed)
  const startGame = useStore(state => state.startGame)
  const resetGame = useStore(state => state.resetGame)
  const debugMode = useStore(state => state.debugMode)
  const toggleDebug = useStore(state => state.toggleDebug)
  const hasShield = useStore(state => state.hasShield)
  const magnetActive = useStore(state => state.magnetActive)
  const magnetExpiry = useStore(state => state.magnetExpiry)
  const timeOfDay = useStore(state => state.timeOfDay)
  const [_, setTick] = React.useState(0)
  const [showInfo, setShowInfo] = React.useState(false)

  const hours = Math.floor(timeOfDay)
  const minutes = Math.floor((timeOfDay % 1) * 60)
  const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

  // Force re-render for timer
  useEffect(() => {
    if (magnetActive) {
      const interval = setInterval(() => setTick(t => t + 1), 100)
      return () => clearInterval(interval)
    }
  }, [magnetActive])

  // Input for Debug Toggle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === 'i') {
        toggleDebug()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleDebug])

  // Background Music
  useEffect(() => {
    const bgm = new Audio(`${import.meta.env.BASE_URL}Sleigh_Shenanigans.mp3`)
    bgm.loop = true
    bgm.volume = 0.4

    if (isPlaying && !isGameOver) {
      bgm.play().catch(e => console.warn("Audio play failed", e))
    }

    return () => {
      bgm.pause()
      bgm.currentTime = 0
    }
  }, [isPlaying, isGameOver])

  // Christmas Music for Menu
  useEffect(() => {
    const menuMusic = new Audio(`${import.meta.env.BASE_URL}christmasmusic.mp3`)
    menuMusic.loop = true
    menuMusic.volume = 0.3

    if (!isPlaying) {
      menuMusic.play().catch(e => console.warn("Menu audio play failed", e))
    }

    return () => {
      menuMusic.pause()
      menuMusic.currentTime = 0
    }
  }, [isPlaying])

  return (
    <div className="app-container">
      <GameLoadingScreen />

      <div className="ui-layer">
        {!isPlaying && !isGameOver && (
          <>
            <video
              className="menu-background-video"
              autoPlay
              loop
              muted
              playsInline
              src="/BakcroundVid.mov"
            />
            <div className="menu">
              <h1>North Pole Rush</h1>
              <p className="high-score">Best: {highScore}</p>
              <p>Race through the Arctic trail and collect gifts!</p>
              <div className="menu-buttons">
                <button onClick={startGame}>Start Game</button>
                <button onClick={() => setShowInfo(true)} className="info-button">How to Play</button>
              </div>
            </div>
          </>
        )}

        {showInfo && !isPlaying && (
          <div className="info-modal">
            <div className="info-content">
              <h2>How to Play</h2>

              <div className="info-section">
                <h3>🎮 Controls</h3>
                <p><strong>A / ← Left Arrow:</strong> Move left</p>
                <p><strong>D / → Right Arrow:</strong> Move right</p>
                <p><strong>W / ↑ Up Arrow / Space:</strong> Jump</p>
                <p><strong>S / ↓ Down Arrow:</strong> Duck</p>
              </div>

              <div className="info-section">
                <h3>🎁 Obstacles & Items</h3>
                <p><strong>Gifts (Red boxes):</strong> Collect for points!</p>
                <p><strong>Snowmen:</strong> Avoid or jump over</p>
                <p><strong>Rocks:</strong> Jump over them</p>
                <p><strong>Candy Cane Arches:</strong> Duck under</p>
              </div>

              <div className="info-section">
                <h3>⚡ Power-Ups (Jump to collect)</h3>
                <p><strong>🛡️ Shield:</strong> Protects from one collision</p>
                <p><strong>🧲 Magnet (10s):</strong> Auto-collect nearby gifts</p>
              </div>

              <div className="info-section">
                <h3>📈 Game Mechanics</h3>
                <p>• Speed increases by <strong>0.5</strong> with each gift collected</p>
                <p>• The game cycles through 4 biomes: Mountain, Forest, Candy, Icy Peaks</p>
                <p>• Day/night cycle creates different atmospheres</p>
              </div>

              <button onClick={() => setShowInfo(false)}>Close</button>
            </div>
          </div>
        )}

        {isPlaying && (
          <>
            <div className="hud">
              <div className="stats-main">
                <h2>Score: {score}</h2>
                <div className="hud-meta">
                  <p className="hud-high-score">Record: {highScore}</p>
                  <p className="hud-time">🕒 {timeStr}</p>
                </div>
              </div>

              {/* Power-ups Section */}
              <div className="powerups-hud">
                {hasShield && (
                  <div className="powerup-item shield">
                    <span className="icon">🛡️</span>
                    <span className="label">SHIELD</span>
                  </div>
                )}
                {magnetActive && (
                  <div className="powerup-item magnet">
                    <span className="icon">🧲</span>
                    <span className="label">MAGNET {Math.max(0, Math.ceil((magnetExpiry - Date.now()) / 1000))}s</span>
                  </div>
                )}
              </div>
            </div>
            <div className="speedometer-text">
              {Math.round(speed * 2 - 10)} km/h
            </div>
          </>
        )}

        {isGameOver && (
          <div className="menu">
            <h1>Game Over!</h1>
            <div className="final-stats">
              <p>Final Score: {score}</p>
              {score >= highScore && score > 0 && <p className="new-best">🎁 NEW BEST! 🎁</p>}
              <p className="high-score">High Score: {highScore}</p>
            </div>
            <button onClick={resetGame}>Try Again</button>
          </div>
        )}
      </div>

      <Canvas
        shadows={false}
        camera={{ position: [0, 5, 10], fov: 50 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace,
          preserveDrawingBuffer: true // Sometimes helps with stability
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#1a1a2e')
          // Lock these settings
          window.renderer = gl
        }}
      >
        <EngineWarmer />
        <Game />
        {debugMode && <Stats className="fps-counter" />}
      </Canvas>

    </div>
  )
}

