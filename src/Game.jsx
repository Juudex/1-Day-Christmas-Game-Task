import React, { Suspense } from 'react'
import { Environment } from './components/Environment'
import { Player } from './components/Player'
import { Track } from './components/Track'

export function Game() {
    return (
        <>
            <Environment />
            <Suspense fallback={null}>
                <group position={[0, -2, 0]}>
                    <Track />
                    <Player />
                </group>
            </Suspense>
        </>
    )
}
