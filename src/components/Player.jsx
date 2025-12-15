import React, { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'
import { LANE_WIDTH } from '../constants'
import { lerp } from 'three/src/math/MathUtils'
import { useGLTF, Sparkles } from '@react-three/drei'

export function Player() {
    const { isPlaying, isGameOver, currentLane, setLane } = useStore()
    const group = useRef()

    // Load Models
    const santa = useGLTF('/Santa Claus.glb')

    // Handle Input
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isPlaying || isGameOver) return

            if (e.key === 'ArrowLeft' || e.key === 'a') {
                setLane(Math.max(currentLane - 1, -1))
            } else if (e.key === 'ArrowRight' || e.key === 'd') {
                setLane(Math.min(currentLane + 1, 1))
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isPlaying, isGameOver, currentLane, setLane])

    // Update Position
    useFrame((state, delta) => {
        if (!group.current) return

        // Smoothly interpolate X position
        const targetX = currentLane * LANE_WIDTH
        group.current.position.x = lerp(group.current.position.x, targetX, delta * 10)

        // Slight tilt when moving
        const tilt = (targetX - group.current.position.x) * 0.1
        group.current.rotation.z = tilt

        // Bobbing motion
        group.current.position.y = Math.sin(state.clock.elapsedTime * 15) * 0.03
    })

    return (
        <group ref={group} position={[0, 0, 0]}>
            {/* Assemble Sled and Santa */}
            <group rotation={[0, Math.PI, 0]}>
                <primitive object={santa.scene} scale={0.8} position={[0, 0, 0]} />
                {/* Snow Trail / Dust Effect */}
                <Sparkles
                    count={50}
                    scale={[1.5, 0.5, 2]}
                    size={6}
                    speed={0.4}
                    opacity={0.5}
                    color="#AEE"
                    position={[0, 0.5, -1.5]}
                />
            </group>

            {/* Debug Hitbox for Player */}
            {useStore(state => state.debugMode) && (
                <mesh position={[0, 0.5, 0]}>
                    <boxGeometry args={[1, 1, 1.6]} />
                    <meshStandardMaterial color="green" wireframe transparent opacity={0.5} />
                </mesh>
            )}
        </group>
    )
}
