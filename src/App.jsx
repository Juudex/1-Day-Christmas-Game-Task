import React, { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { Stats } from '@react-three/drei'
import { Game } from './Game'
import { useStore } from './store'
import './index.css'

export default function App() {
  const { isPlaying, isGameOver, score, startGame, resetGame, gameId, debugMode, toggleDebug } = useStore()

  // Input for Debug Toggle
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'i') {
        toggleDebug()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleDebug])

  // Background Music
  useEffect(() => {
    const bgm = new Audio('/Sleigh Shenanigans.mp3')
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
            <p>Use Left/Right Arrows or A/D to move</p>
            <button onClick={startGame}>Start Game</button>
          </div>
        )}

        {isPlaying && (
          <div className="hud">
            <h2>Score: {score}</h2>
          </div>
        )}

        {isGameOver && (
          <div className="menu">
            <h1>Game Over!</h1>
            <p>Final Score: {score}</p>
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
