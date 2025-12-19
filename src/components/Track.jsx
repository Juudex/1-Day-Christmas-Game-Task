import React, { useState, useRef, useEffect, useMemo, forwardRef, useImperativeHandle, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'
import { Rock, Snowman, CandyCaneArch, Gift, AbilityBox, MountainSide, ForestSide, CandySide, MountainPeakSide } from './Obstacles'
import { SEGMENT_LENGTH, LANE_WIDTH, PLAYER_HITBOX, OBSTACLE_HITBOX, GIFT_HITBOX, ARCH_HITBOX } from '../constants'
import { lerp } from 'three/src/math/MathUtils'
import * as THREE from 'three'

const SEGMENT_COUNT = 10

function randomItems() {
    const items = []
    const lanes = [-1, 0, 1]

    // Shuffle lanes
    for (let i = lanes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [lanes[i], lanes[j]] = [lanes[j], lanes[i]];
    }

    const maxObstacles = 2
    let obstacleCount = 0

    lanes.forEach(lane => {
        const r = Math.random()
        const zOffset = Math.random() * (SEGMENT_LENGTH - 4) - (SEGMENT_LENGTH / 2 - 2)

        if (r < 0.2) {
            // Nothing
        } else if (r < 0.45) {
            items.push({ id: Math.random(), lane, zOffset, type: 'gift', collected: false })
        } else if (r < 0.5) {
            items.push({ id: Math.random(), lane, zOffset, type: 'ability', collected: false })
        } else {
            if (obstacleCount < maxObstacles) {
                const rand = Math.random()
                // Removed 'tree' as it's now environmental
                let type = 'snowman'
                if (rand < 0.33) type = 'snowman'
                else if (rand < 0.66) type = 'rock'
                else type = 'arch'

                items.push({ id: Math.random(), lane, zOffset, type, collected: false })
                obstacleCount++
            }
        }
    })

    return items
}

const snowGeometry = new THREE.PlaneGeometry(60, SEGMENT_LENGTH)
const snowMaterial = new THREE.MeshStandardMaterial({ color: "#fff", roughness: 1 })

const TrackSegment = memo(forwardRef(({ index, items, leftMtnRot, rightMtnRot, biome }, ref) => {
    return (
        <group ref={ref}>
            {/* Environment Side Decorations */}
            {biome === 'mountain' && (
                <>
                    <MountainSide position={[-17, 0, 0]} rotation={leftMtnRot} />
                    <MountainSide position={[17, 0, 0]} rotation={rightMtnRot} />
                </>
            )}
            {biome === 'forest' && (
                <>
                    <ForestSide position={[-10, 0, 0]} rotation={[0, 0, 0]} scale={[-1, 1, 1]} />
                    <ForestSide position={[10, 0, 0]} rotation={[0, 0, 0]} />
                </>
            )}
            {biome === 'candy' && (
                <>
                    <CandySide position={[-10, 0, 0]} rotation={[0, 0, 0]} scale={[-1, 1, 1]} />
                    <CandySide position={[10, 0, 0]} rotation={[0, 0, 0]} />
                </>
            )}
            {biome === 'icy-peaks' && (
                <>
                    <MountainPeakSide position={[-21, 0, 0]} rotation={leftMtnRot} />
                    <MountainPeakSide position={[21, 0, 0]} rotation={rightMtnRot} />
                </>
            )}

            {/* Snow Floor - Reusing resources */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow geometry={snowGeometry} material={snowMaterial} />


            {/* Items */}
            {items.map((item, idx) => {
                const pos = [item.lane * LANE_WIDTH, 0, item.zOffset]
                return (
                    <group key={item.id} position={pos}>
                        {item.type === 'snowman' && <Snowman position={[0, 0, 0]} />}
                        {item.type === 'rock' && <Rock position={[0, 0, 0]} />}
                        {item.type === 'arch' && <CandyCaneArch position={[0, 0, 0]} />}
                        {item.type === 'ability' && <AbilityBox position={[0, 0, 0]} />}
                        {item.type === 'gift' && <Gift position={[0, 0, 0]} collected={item.collected} collectedAt={item.collectedAt} />}
                    </group>
                )
            })}
        </group>
    )
}), (prev, next) => {
    // Only re-render if index changes (recycle) or biome changes or items were collected
    return (
        prev.index === next.index &&
        prev.biome === next.biome &&
        prev.items.filter(i => i.collected).length === next.items.filter(i => i.collected).length
    )
})

export function Track() {
    const isPlaying = useStore(state => state.isPlaying)
    const isGameOver = useStore(state => state.isGameOver)
    const gameId = useStore(state => state.gameId)
    const increaseScore = useStore(state => state.increaseScore)
    const endGame = useStore(state => state.endGame)
    const activateRandomPowerUp = useStore(state => state.activateRandomPowerUp)

    const segmentsRef = useRef([])
    const groupRefs = useRef([])
    const [_, forceUpdate] = useState(0)

    const resetSegments = () => {
        const initial = []
        for (let i = 0; i < SEGMENT_COUNT; i++) {
            const biomes = ['mountain', 'forest', 'candy', 'icy-peaks']
            const biomeIdx = Math.floor(i / 10) % biomes.length
            initial.push({
                index: i,
                z: -i * SEGMENT_LENGTH,
                items: i < 3 ? [] : randomItems(),
                leftMtnRot: [0, (Math.random() - 0.5) * 0.5, 0],
                rightMtnRot: [0, (Math.random() - 0.5) * 0.5 + Math.PI, 0],
                biome: biomes[biomeIdx]
            })
        }
        segmentsRef.current = initial
        forceUpdate(n => n + 1)
    }

    // Initial setup
    useEffect(() => {
        resetSegments()
    }, [gameId])


    useFrame((state, delta) => {
        if (!isPlaying || isGameOver) return

        const store = useStore.getState()
        const speed = store.speed
        const moveAmount = speed * delta
        let needsUpdate = false

        segmentsRef.current.forEach((seg, i) => {
            seg.z += moveAmount
            if (groupRefs.current[i]) {
                groupRefs.current[i].position.z = seg.z
            }

            if (seg.z > SEGMENT_LENGTH) {
                seg.z -= SEGMENT_COUNT * SEGMENT_LENGTH
                seg.index += SEGMENT_COUNT

                const biomes = ['mountain', 'forest', 'candy', 'icy-peaks']
                seg.biome = biomes[Math.floor(seg.index / 10) % 4]

                seg.items = randomItems()
                seg.leftMtnRot = [0, (Math.random() - 0.5) * 0.5, 0]
                seg.rightMtnRot = [0, (Math.random() - 0.5) * 0.5 + Math.PI, 0]
                needsUpdate = true
            }
        })

        const { playerX, magnetActive, isJumping, isDucking, hasShield } = store

        segmentsRef.current.forEach(seg => {
            if (Math.abs(seg.z) > SEGMENT_LENGTH + 10) return

            seg.items.forEach(item => {
                if (item.collected) return

                const itemZ = seg.z + item.zOffset + (item.type === 'arch' ? 4 : 0) + (item.type === 'gift' ? 2 : 0)
                let itemX = item.lane * LANE_WIDTH

                if (item.type === 'gift' && magnetActive && Math.abs(itemZ) < 15) {
                    item.collected = true
                    item.collectedAt = Date.now()
                    increaseScore()
                    needsUpdate = true
                    return
                }

                const zDist = Math.abs(itemZ)
                const hitboxDepth = (item.type === 'gift' ? GIFT_HITBOX.depth : OBSTACLE_HITBOX.depth) / 2 + PLAYER_HITBOX.depth / 2

                if (zDist < hitboxDepth) {
                    const xDist = Math.abs(itemX - playerX)
                    const hitboxWidth = (item.type === 'gift' ? GIFT_HITBOX.width : OBSTACLE_HITBOX.width) / 2 + PLAYER_HITBOX.width / 2

                    if (xDist < hitboxWidth) {
                        if (item.type === 'gift') {
                            item.collected = true
                            item.collectedAt = Date.now()
                            increaseScore()
                            needsUpdate = true
                        } else if (item.type === 'ability') {
                            if (isJumping) {
                                item.collected = true
                                activateRandomPowerUp()
                                needsUpdate = true
                            }
                        } else {
                            if (item.type === 'rock' && isJumping) {
                                // Safe
                            } else if (item.type === 'arch' && isDucking) {
                                // Safe
                            } else if (hasShield) {
                                item.collected = true
                                useStore.getState().setShield(false)
                                needsUpdate = true
                            } else {
                                endGame()
                            }
                        }
                    }
                }
            })
        })

        if (needsUpdate) forceUpdate(n => n + 1)
    })


    return (
        <>
            {segmentsRef.current.map((seg, i) => (
                <TrackSegment
                    key={i}
                    ref={el => groupRefs.current[i] = el}
                    index={seg.index}
                    items={seg.items}
                    leftMtnRot={seg.leftMtnRot}
                    rightMtnRot={seg.rightMtnRot}
                    biome={seg.biome}
                />
            ))}
        </>
    )
}
