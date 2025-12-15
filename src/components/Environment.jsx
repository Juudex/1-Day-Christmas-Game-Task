import React from 'react'
import { Stars, Sparkles } from '@react-three/drei'

export function Environment() {
    return (
        <>
            {/* Day Sky */}
            <color attach="background" args={['#87CEEB']} />
            <fog attach="fog" args={['#87CEEB', 10, 50]} />

            <ambientLight intensity={0.8} color="#ffffff" />
            <directionalLight
                position={[10, 20, 10]}
                intensity={1.2}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-left={-20}
                shadow-camera-right={20}
                shadow-camera-top={20}
                shadow-camera-bottom={-20}
                shadow-bias={-0.0005}
            />

            {/* Global Snow */}
            <Sparkles count={1000} scale={[30, 20, 20]} size={4} speed={1} opacity={0.8} color="#fff" />
        </>
    )
}
