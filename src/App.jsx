import React, { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stats } from '@react-three/drei'
import { Game } from './Game'
import { useStore } from './store'
import './index.css'

export default function App() {
  const { isPlaying, isGameOver, score, highScore, speed, startGame, resetGame, gameId, debugMode, toggleDebug, hasShield, magnetActive, magnetExpiry, timeOfDay } = useStore()
  const [_, setTick] = React.useState(0)

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

  return (
    <div className="app-container">
      <div className="ui-layer">
        {!isPlaying && !isGameOver && (
          <div className="menu">
            <h1>Santa's Sled Slide</h1>
            <p className="high-score">Best: {highScore}</p>
            <p>Use Left/Right Arrows or A/D to move</p>
            <button onClick={startGame}>Start Game</button>
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
              {Math.round(speed * 5)} km/h
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

      <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
        <Game key={gameId} />
        {debugMode && <Stats className="fps-counter" />}
      </Canvas>
    </div>
  )
}
