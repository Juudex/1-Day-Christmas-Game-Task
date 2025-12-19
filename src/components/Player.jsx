import React, { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'
import { LANE_WIDTH, PLAYER_HITBOX, JUMP_FORCE, GRAVITY } from '../constants'
import { lerp } from 'three/src/math/MathUtils'
import { useGLTF, Sparkles, useAnimations } from '@react-three/drei'

export function Player() {
    const isPlaying = useStore(state => state.isPlaying)
    const isGameOver = useStore(state => state.isGameOver)
    const setLane = useStore(state => state.setLane)
    const setPlayerX = useStore(state => state.setPlayerX)
    const setJumping = useStore(state => state.setJumping)
    const setDucking = useStore(state => state.setDucking)
    const isJumping = useStore(state => state.isJumping)
    const isDucking = useStore(state => state.isDucking)
    const hasShield = useStore(state => state.hasShield)
    const magnetActive = useStore(state => state.magnetActive)
    const gameId = useStore(state => state.gameId)

    const group = useRef()
    const verticalVelocity = useRef(0)
    const yPos = useRef(0)
    const duckingTimeout = useRef()

    // Load Models and Animations
    const santa = useGLTF(`${import.meta.env.BASE_URL}Santa_Claus.glb`)
    const { actions } = useAnimations(santa.animations, group)

    // Reset Player when game restarts
    useEffect(() => {
        if (group.current) {
            group.current.position.set(0, 0, 0)
            group.current.rotation.set(0, 0, 0)
        }
        yPos.current = 0
        verticalVelocity.current = 0
    }, [gameId])

    // Start Sprint animation when game starts
    useEffect(() => {
        if (actions && isPlaying && !isGameOver) {
            actions['Armature|Sprint']?.reset().fadeIn(0.3).play()
            actions['Armature|Idle']?.stop()
        } else if (actions && !isPlaying) {
            actions['Armature|Idle']?.reset().fadeIn(0.3).play()
            actions['Armature|Sprint']?.stop()
        }
    }, [actions, isPlaying, isGameOver])


    // Handle Input
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isPlaying || isGameOver) return

            const key = e.key
            const currentLane = useStore.getState().currentLane

            if ((key === 'ArrowLeft' || key === 'a') && currentLane > -1) {
                setLane(currentLane - 1)
            } else if ((key === 'ArrowRight' || key === 'd') && currentLane < 1) {
                setLane(currentLane + 1)
            } else if ((key === 'ArrowUp' || key === ' ' || key === 'w') && !isJumping) {
                setJumping(true)
                verticalVelocity.current = JUMP_FORCE
            } else if ((key === 'ArrowDown' || key === 's') && !isDucking && !isJumping) {
                setDucking(true)
                clearTimeout(duckingTimeout.current)
                duckingTimeout.current = setTimeout(() => setDucking(false), 800)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isPlaying, isGameOver, setLane, isJumping, setJumping, isDucking, setDucking])

    // Update Position
    useFrame((state, delta) => {
        if (!group.current) return

        const currentLane = useStore.getState().currentLane
        // Smoothly interpolate X position
        const targetX = currentLane * LANE_WIDTH
        group.current.position.x = lerp(group.current.position.x, targetX, delta * 10)
        setPlayerX(group.current.position.x)

        // Handle Jump Physics
        if (isJumping) {
            yPos.current += verticalVelocity.current * delta
            verticalVelocity.current -= GRAVITY * delta

            if (yPos.current <= 0) {
                yPos.current = 0
                verticalVelocity.current = 0
                setJumping(false)
            }
        }

        // Slight tilt when moving
        const tilt = (targetX - group.current.position.x) * 0.3
        group.current.rotation.z = -tilt // Negative for correct lean direction

        // Bobbing effect
        const bobbing = Math.sin(state.clock.elapsedTime * 15) * 0.03
        group.current.position.y = yPos.current + bobbing

        // Duck rotation
        if (isDucking) {
            group.current.rotation.x = lerp(group.current.rotation.x, -Math.PI / 6, delta * 10)
        } else {
            group.current.rotation.x = lerp(group.current.rotation.x, 0, delta * 10)
        }

        // Animation Control - only switch when state changes
        if (actions && isPlaying) {
            if (isJumping && !actions['Armature|Jump']?.isRunning()) {
                // Switch to jump
                actions['Armature|Jump']?.reset().fadeIn(0.2).play()
                actions['Armature|Sprint']?.fadeOut(0.2)
            } else if (!isJumping && !isGameOver && !actions['Armature|Sprint']?.isRunning()) {
                // Switch back to sprint
                actions['Armature|Sprint']?.reset().fadeIn(0.2).play()
                actions['Armature|Jump']?.fadeOut(0.2)
            }
        }
    })


    return (
        <group ref={group} position={[0, 0, 0]}>
            {/* Subtle glow around Santa */}
            <pointLight position={[0, 1, 0]} intensity={0.6} color="#ffeecc" distance={4} decay={2} />

            {/* Santa Model */}
            <group rotation={[0, Math.PI, 0]}>
                <primitive object={santa.scene} scale={0.8} position={[0, 0, 0]} />
            </group>

            {/* Shield Visual Effect */}
            {hasShield && (
                <mesh position={[0, 0.8, 0]}>
                    <sphereGeometry args={[1.5, 32, 32]} />
                    <meshStandardMaterial
                        color="#00ffff"
                        transparent
                        opacity={0.3}
                        emissive="#00ffff"
                        emissiveIntensity={2}
                        wireframe
                    />
                </mesh>
            )}

            {/* Magnet Sparkles */}
            {magnetActive && (
                <Sparkles count={30} scale={3} size={3} speed={0.5} color="#ff0000" />
            )}

            {/* Debug Mode hitbox visualization */}
            {useStore(state => state.debugMode) && (
                <mesh position={[0, PLAYER_HITBOX.height / 2, 0]}>
                    <boxGeometry args={[PLAYER_HITBOX.width, PLAYER_HITBOX.height, PLAYER_HITBOX.depth]} />
                    <meshStandardMaterial color="green" wireframe transparent opacity={0.5} />
                </mesh>
            )}
        </group>
    )
}
