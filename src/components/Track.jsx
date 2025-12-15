import React, { useState, useRef, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'
import { Tree, Rock, Gift, MountainSide } from './Obstacles'
import { SEGMENT_LENGTH, LANE_WIDTH } from '../constants'

const SEGMENT_COUNT = 10

function randomItems() {
    const items = []
    const lanes = [-1, 0, 1]

    // Shuffle lanes to randomize which ones get items
    for (let i = lanes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [lanes[i], lanes[j]] = [lanes[j], lanes[i]];
    }

    // Decide how many obstacles (Tree/Rock) to spawn. Max 2 to ensure 1 lane is always passable.
    const maxObstacles = 2
    let obstacleCount = 0

    lanes.forEach(lane => {
        const r = Math.random()
        const zOffset = Math.random() * (SEGMENT_LENGTH - 4) - (SEGMENT_LENGTH / 2 - 2)

        // 30% chance - Nothing
        // 20% chance - Gift
        // 50% chance - Obstacle (if limit not reached)

        if (r < 0.3) {
            // Nothing
        } else if (r < 0.5) {
            items.push({ id: Math.random(), lane, zOffset, type: 'gift', collected: false })
        } else {
            if (obstacleCount < maxObstacles) {
                const type = Math.random() > 0.5 ? 'tree' : 'rock'
                items.push({ id: Math.random(), lane, zOffset, type, collected: false })
                obstacleCount++
            } else {
                // Determine fallback if limit reached (nothing or gift)
                if (Math.random() > 0.5) {
                    items.push({ id: Math.random(), lane, zOffset, type: 'gift', collected: false })
                }
            }
        }
    })

    return items
}

const TrackSegment = forwardRef(({ index, items, leftMtnRot, rightMtnRot }, ref) => {
    return (
        <group ref={ref}>
            {/* Mountains */}
            <MountainSide position={[-18, 0, 0]} rotation={leftMtnRot} />
            <MountainSide position={[18, 0, 0]} rotation={rightMtnRot} />

            {/* Snow Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[40, SEGMENT_LENGTH]} />
                <meshStandardMaterial color="#fff" roughness={1} />
            </mesh>

            {/* Items */}
            {items.map((item, idx) => {
                if (item.collected) return null
                const pos = [item.lane * LANE_WIDTH, 0, item.zOffset]
                return (
                    <group key={item.id} position={pos}>
                        {item.type === 'tree' && <Tree position={[0, 0, 0]} />}
                        {item.type === 'rock' && <Rock position={[0, 0, 0]} />}
                        {item.type === 'gift' && <Gift position={[0, 0, 0]} />}
                    </group>
                )
            })}
        </group>
    )
})

export function Track() {
    const { speed, isPlaying, isGameOver, increaseScore, endGame } = useStore()

    // We maintain persistent objects for segments
    const segmentsRef = useRef([])

    // Refs for the THREE.Group of each segment used for direct manipulation
    const groupRefs = useRef([])

    // We need a forceUpdate to render new content when a segment recycles
    const [_, forceUpdate] = useState(0)

    // Initialize segments once
    useMemo(() => {
        const initial = []
        for (let i = 0; i < SEGMENT_COUNT; i++) {
            initial.push({
                index: i,
                z: -i * SEGMENT_LENGTH,
                items: i < 3 ? [] : randomItems(),
                leftMtnRot: [0, (Math.random() - 0.5) * 0.5, 0],
                rightMtnRot: [0, (Math.random() - 0.5) * 0.5 + Math.PI, 0]
            })
        }
        segmentsRef.current = initial
    }, [])

    useFrame((state, delta) => {
        if (!isPlaying || isGameOver) return

        const currentSpeed = speed
        const moveAmount = currentSpeed * delta

        let needsUpdate = false

        segmentsRef.current.forEach((seg, i) => {
            // Move segment forward in data
            seg.z += moveAmount

            // Direct DOM update (High Perf)
            if (groupRefs.current[i]) {
                groupRefs.current[i].position.z = seg.z
            }

            // Check if it passed the camera
            if (seg.z > SEGMENT_LENGTH) {
                seg.z -= SEGMENT_COUNT * SEGMENT_LENGTH
                seg.items = randomItems()
                seg.leftMtnRot = [0, (Math.random() - 0.5) * 0.5, 0]
                seg.rightMtnRot = [0, (Math.random() - 0.5) * 0.5 + Math.PI, 0]
                needsUpdate = true
            }
        })

        if (needsUpdate) forceUpdate(n => n + 1)

        // Collision Detection
        const playerLane = useStore.getState().currentLane

        segmentsRef.current.forEach(seg => {
            if (Math.abs(seg.z) > SEGMENT_LENGTH) return

            seg.items.forEach(item => {
                if (item.collected) return

                const itemZ = seg.z + item.zOffset

                if (Math.abs(itemZ) < 0.8) {
                    if (item.lane === playerLane) {
                        if (item.type === 'gift') {
                            item.collected = true
                            increaseScore()
                            forceUpdate(n => n + 1)
                        } else {
                            endGame()
                        }
                    }
                }
            })
        })
    })

    return (
        <>
            {segmentsRef.current.map((seg, i) => (
                <TrackSegment
                    key={seg.index}
                    ref={el => groupRefs.current[i] = el}
                    index={seg.index}
                    items={seg.items}
                    leftMtnRot={seg.leftMtnRot}
                    rightMtnRot={seg.rightMtnRot}
                />
            ))}
        </>
    )
}
