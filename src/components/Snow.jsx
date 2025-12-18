import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Snow({ count = 2500 }) {
    const points = useRef()

    // Create a large box of random positions
    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3)
        const velocities = new Float32Array(count)
        const phases = new Float32Array(count)

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 50    // X
            positions[i * 3 + 1] = Math.random() * 40         // Y
            positions[i * 3 + 2] = (Math.random() - 0.9) * 60 // Z (-54 to 6)

            velocities[i] = 0.5 + Math.random() * 2           // Falling speed
            phases[i] = Math.random() * Math.PI * 2           // Wind phase
        }

        return { positions, velocities, phases }
    }, [count])

    useFrame((state, delta) => {
        const { positions, velocities, phases } = particles
        const time = state.clock.elapsedTime

        for (let i = 0; i < count; i++) {
            // Apply falling speed
            positions[i * 3 + 1] -= velocities[i] * delta * 2

            // Apply horizontal drift (wind)
            positions[i * 3] += Math.sin(time + phases[i]) * 0.01

            // Wrap vertical
            if (positions[i * 3 + 1] < -5) {
                positions[i * 3 + 1] = 35
            }

            // Wrap horizontal X
            if (positions[i * 3] > 25) positions[i * 3] = -25
            if (positions[i * 3] < -25) positions[i * 3] = 25

            // Wrap Z
            if (positions[i * 3 + 2] > 6) positions[i * 3 + 2] = -54
        }

        points.current.geometry.attributes.position.needsUpdate = true
    })

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particles.positions.length / 3}
                    array={particles.positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.15}
                color="white"
                transparent
                opacity={0.6}
                sizeAttenuation={true}
            />
        </points>
    )
}
