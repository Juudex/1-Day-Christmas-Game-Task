import React, { useEffect, useState } from 'react'
import { useProgress } from '@react-three/drei'

export function GameLoadingScreen() {
    const { active, progress, errors, item, loaded, total } = useProgress()
    const [isFinished, setIsFinished] = useState(false)
    const [countdown, setCountdown] = useState(2)

    useEffect(() => {
        if (!active && progress === 100) {
            // Small delay to ensure shaders have warmed up
            const timer = setTimeout(() => setIsFinished(true), 2000)

            // Countdown timer
            const countdownInterval = setInterval(() => {
                setCountdown(prev => Math.max(0, prev - 0.1))
            }, 100)

            return () => {
                clearTimeout(timer)
                clearInterval(countdownInterval)
            }
        }

    }, [active, progress])

    if (isFinished) return null

    return (
        <div className="loading-screen">
            <div className="loading-content">
                <h1>NORTH POLE RUSH</h1>
                <div className="loading-bar-container">
                    <div
                        className="loading-bar-fill"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p>{progress === 100 ? `Ready in ${countdown.toFixed(1)}s...` : `Loading Assets: ${Math.round(progress)}%`}</p>
                <h2 className="loading-disclaimer ">⚡ Best experienced on Chrome</h2>
            </div>
        </div>
    )
}
