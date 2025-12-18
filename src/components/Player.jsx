import React, { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'
import { LANE_WIDTH, PLAYER_HITBOX, JUMP_FORCE, GRAVITY } from '../constants'
import { lerp } from 'three/src/math/MathUtils'
import { useGLTF, Sparkles } from '@react-three/drei'

export function Player() {
    const { isPlaying, isGameOver, currentLane, setLane, setPlayerX, isJumping, setJumping, isDucking, setDucking, hasShield, magnetActive } = useStore()
    const group = useRef()
    const verticalVelocity = useRef(0)
    const yPos = useRef(0)
    const duckingTimeout = useRef()

    // Load Models
    const santa = useGLTF(`${import.meta.env.BASE_URL}Santa_Claus.glb`)

    // Handle Input
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isPlaying || isGameOver) return

            const key = e.key.toLowerCase()
            if (key === 'arrowleft' || key === 'a') {
                setLane(Math.max(currentLane - 1, -1))
            } else if (key === 'arrowright' || key === 'd') {
                setLane(Math.min(currentLane + 1, 1))
            } else if ((key === ' ' || key === 'w' || key === 'arrowup') && !isJumping) {
                setJumping(true)
                verticalVelocity.current = JUMP_FORCE
            } else if ((key === 's' || key === 'arrowdown') && !isDucking && !isJumping) {
                setDucking(true)
                if (duckingTimeout.current) clearTimeout(duckingTimeout.current)
                duckingTimeout.current = setTimeout(() => {
                    setDucking(false)
                }, 1000)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isPlaying, isGameOver, currentLane, setLane, isJumping, setJumping, isDucking, setDucking])

    // Update Position
    useFrame((state, delta) => {
        if (!group.current) return

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

        // Combine Jump height with Bobbing motion
        const bobbing = Math.sin(state.clock.elapsedTime * 15) * 0.03
        group.current.position.y = yPos.current + bobbing

        // Handle Ducking Visualization
        if (isDucking) {
            group.current.rotation.x = lerp(group.current.rotation.x, -Math.PI / 3, delta * 15)
            group.current.position.y -= 0.5
        } else {
            group.current.rotation.x = lerp(group.current.rotation.x, 0, delta * 15)
        }
    })

    return (
        <group ref={group} position={[0, 0, 0]}>
            {/* Santa Only */}
            <group rotation={[0, Math.PI, 0]}>
                <primitive object={santa.scene} scale={0.8} position={[0, 0, 0]} />
                <Sparkles
                    count={50}
                    scale={[1.5, 0.5, 2]}
                    size={6}
                    speed={0.4}
                    opacity={0.5}
                    color="#AEE"
                    position={[0, 0.5, -1.5]}
                />

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

                {/* Magnet Visual Effect */}
                {magnetActive && (
                    <group position={[0, 1, 0]}>
                        <Sparkles
                            count={30}
                            scale={[2, 2, 2]}
                            size={10}
                            speed={2}
                            opacity={0.8}
                            color="#ff0000"
                        />
                        <Sparkles
                            count={30}
                            scale={[2, 2, 2]}
                            size={10}
                            speed={2}
                            opacity={0.8}
                            color="#ffffff"
                        />
                    </group>
                )}
            </group>

            {/* Debug Hitbox for Player */}
            {useStore(state => state.debugMode) && (
                <mesh position={[0, 0.5, 0]}>
                    <boxGeometry args={[PLAYER_HITBOX.width, 1, PLAYER_HITBOX.depth]} />
                    <meshStandardMaterial color="green" wireframe transparent opacity={0.5} />
                </mesh>
            )}
        </group>
    )
}
