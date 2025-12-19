import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Snow({ count = 2500 }) {
    const points = useRef()

    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3)
        const velocities = new Float32Array(count)
        const phases = new Float32Array(count)

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 60    // X
            positions[i * 3 + 1] = Math.random() * 40         // Y
            positions[i * 3 + 2] = (Math.random() - 0.9) * 80 // Z

            velocities[i] = 1.0 + Math.random() * 2.5
            phases[i] = Math.random() * Math.PI * 2
        }

        return { positions, velocities, phases }
    }, [count])

    useFrame((state, delta) => {
        if (!points.current) return
        const { positions, velocities, phases } = particles
        const time = state.clock.elapsedTime
        const d2 = delta * 2

        for (let i = 0; i < count; i++) {
            const i3 = i * 3
            positions[i3 + 1] -= velocities[i] * d2
            positions[i3] += Math.sin(time + phases[i]) * 0.01

            if (positions[i3 + 1] < -5) {
                positions[i3 + 1] = 35
            }

            if (positions[i3] > 30) positions[i3] = -30
            else if (positions[i3] < -30) positions[i3] = 30
        }

        points.current.geometry.attributes.position.needsUpdate = true
    })

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
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


