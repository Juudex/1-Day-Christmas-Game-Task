import React, { Suspense } from 'react'
import { Environment } from './components/Environment'
import { Player } from './components/Player'
import { Track } from './components/Track'
import { Snow } from './components/Snow'

export function Game() {
    return (
        <>
            <Environment />
            <Suspense fallback={null}>
                <group position={[0, -2, 0]}>
                    <Snow />
                    <Track />
                    <Player />
                </group>
            </Suspense>
        </>
    )
}
