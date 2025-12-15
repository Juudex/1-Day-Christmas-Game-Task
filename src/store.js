import { create } from 'zustand'

export const useStore = create((set) => ({
    isPlaying: false,
    isGameOver: false,
    score: 0,
    speed: 10,
    currentLane: 0, // -1, 0, 1
    gameId: 0,

    setLane: (lane) => set({ currentLane: lane }),
    startGame: () => set({ isPlaying: true, isGameOver: false, score: 0, speed: 10, currentLane: 0 }),
    endGame: () => set((state) => {
        if (!state.isGameOver) {
            const audio = new Audio('/car-crash-sound-effect-376874.mp3')
            audio.volume = 0.5
            audio.play().catch(e => console.warn(e))
        }
        return { isPlaying: false, isGameOver: true, speed: 0 }
    }),
    increaseScore: (amount = 1) => set((state) => {
        const audio = new Audio('/fart-5-228245.mp3')
        audio.volume = 0.5
        audio.play().catch(e => console.warn(e))
        return { score: state.score + amount, speed: state.speed + 0.5 }
    }),
    resetGame: () => set((state) => ({ isPlaying: false, isGameOver: false, score: 0, speed: 10, gameId: state.gameId + 1 })),

    debugMode: false,
    toggleDebug: () => set((state) => ({ debugMode: !state.debugMode })),

    debugMode: false,
    toggleDebug: () => set((state) => ({ debugMode: !state.debugMode })),
}))
