import { create } from 'zustand'

export const useStore = create((set) => ({
    isPlaying: false,
    isGameOver: false,
    score: 0,
    highScore: parseInt(localStorage.getItem('santa-high-score')) || 0,
    speed: 10,
    currentLane: 0, // -1, 0, 1
    playerX: 0,
    isJumping: false,
    isDucking: false,
    hasShield: false,
    magnetActive: false,
    magnetExpiry: 0,
    timeOfDay: Math.random() * 24, // 0 to 24 hours
    currentBiome: 'mountain',
    segmentsSincelastBiomeChange: 0,
    gameId: 0,

    setLane: (lane) => set({ currentLane: lane }),
    setPlayerX: (x) => set({ playerX: x }),
    setJumping: (jumping) => set({ isJumping: jumping }),
    setDucking: (ducking) => set({ isDucking: ducking }),
    setShield: (active) => set({ hasShield: active }),
    setMagnet: (active) => set({ magnetActive: active }),
    updateTime: (delta) => set((state) => ({
        timeOfDay: (state.timeOfDay + delta * 0.2) % 24 // 1 game hour every 5 real seconds
    })),
    setBiome: (biome) => set({ currentBiome: biome }),
    activateRandomPowerUp: () => {
        const type = Math.random() > 0.5 ? 'shield' : 'magnet'
        if (type === 'shield') {
            set({ hasShield: true })
        } else {
            const expiry = Date.now() + 10000
            set({ magnetActive: true, magnetExpiry: expiry })
            // We use a timer for the internal state check, but magnetExpiry is for UI
            setTimeout(() => {
                set((state) => {
                    // Only deactivate if another magnet hasn't been picked up since
                    if (Date.now() >= state.magnetExpiry - 100) {
                        return { magnetActive: false, magnetExpiry: 0 }
                    }
                    return {}
                })
            }, 10000)
        }
    },
    startGame: () => set({
        isPlaying: true,
        isGameOver: false,
        score: 0,
        speed: 10,
        currentLane: 0,
        hasShield: false,
        magnetActive: false,
        magnetExpiry: 0,
        timeOfDay: Math.random() * 24
    }),
    endGame: () => set((state) => {
        if (!state.isGameOver) {
            const audio = new Audio(`${import.meta.env.BASE_URL}car-crash-sound-effect-376874.mp3`)
            audio.volume = 0.5
            audio.play().catch(e => console.warn(e))

            // Check for new high score
            if (state.score > state.highScore) {
                localStorage.setItem('santa-high-score', state.score.toString())
                return { isPlaying: false, isGameOver: true, speed: 0, highScore: state.score }
            }
        }
        return { isPlaying: false, isGameOver: true, speed: 0 }
    }),
    increaseScore: (amount = 1) => set((state) => {
        const audio = new Audio(`${import.meta.env.BASE_URL}fart-5-228245.mp3`)
        audio.volume = 0.5
        audio.play().catch(e => console.warn(e))

        const newScore = state.score + amount
        const newSpeed = state.speed + 0.5

        let newHighScore = state.highScore
        if (newScore > state.highScore) {
            newHighScore = newScore
            localStorage.setItem('santa-high-score', newHighScore.toString())
        }

        return { score: newScore, speed: newSpeed, highScore: newHighScore }
    }),
    resetGame: () => set((state) => ({
        isPlaying: false,
        isGameOver: false,
        score: 0,
        speed: 10,
        gameId: state.gameId + 1,
        timeOfDay: Math.random() * 24
    })),

    debugMode: false,
    toggleDebug: () => set((state) => ({ debugMode: !state.debugMode })),
}))
