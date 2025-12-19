import React from 'react'
import { Preload } from '@react-three/drei'
import { Rock, Snowman, CandyCaneArch, Gift, AbilityBox, MountainSide, ForestSide, CandySide, MountainPeakSide } from './Obstacles'

export function EngineWarmer() {
    return (
        <group position={[0, -500, 0]}>
            {/* Render everything at a high-Y offset (technically visible to GPU but hidden from player)
                This ensures the renderer cannot skip shader compilation via visibility checks. */}
            <Snowman position={[0, 0, 0]} />
            <Rock position={[0, 0, 0]} />
            <CandyCaneArch position={[0, 0, 0]} />
            <Gift position={[0, 0, 0]} />
            <AbilityBox position={[0, 0, 0]} />
            <MountainSide position={[0, 0, 0]} />

            {/* Mirrored variants frequently trigger separate shader programs due to negative scaling */}
            <ForestSide position={[-10, 0, 0]} scale={[-1, 1, 1]} />
            <ForestSide position={[10, 0, 0]} scale={[1, 1, 1]} />

            <CandySide position={[-10, 0, 0]} scale={[-1, 1, 1]} />
            <CandySide position={[10, 0, 0]} scale={[1, 1, 1]} />

            <MountainPeakSide position={[0, 0, 0]} />

            <Preload all />
        </group>
    )
}
