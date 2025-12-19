import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Center } from '@react-three/drei'
import { useStore } from '../store'
import { OBSTACLE_HITBOX, GIFT_HITBOX, ARCH_HITBOX } from '../constants'
import * as THREE from 'three'

// Shared materials to minimize shader programs
const debugMaterial = new THREE.MeshStandardMaterial({ color: "red", wireframe: true, transparent: true, opacity: 0.5 })
const snowMaterial = new THREE.MeshStandardMaterial({ color: "#fff", roughness: 0.8 })
const magnetRedMaterial = new THREE.MeshStandardMaterial({ color: "red" })
const magnetWhiteMaterial = new THREE.MeshStandardMaterial({ color: "white" })
const shieldMaterial = new THREE.MeshStandardMaterial({ color: "#00ffff", emissive: "#00ffff", emissiveIntensity: 1 })

// Shared geometries
const debugBoxGeometry = new THREE.BoxGeometry(1, 1, 1)
const rockGeometry = new THREE.DodecahedronGeometry(1.5, 0)
const shieldGeometry = new THREE.OctahedronGeometry(0.5, 0)
const magnetCylinderGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.6)
const magnetCylinderSmallGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.4)

function setupModel(scene) {
    const clone = scene.clone()
    clone.traverse(node => {
        if (node.isMesh) {
            node.castShadow = false
            node.receiveShadow = false
        }
    })
    return clone
}

export function Snowman({ position }) {
    const { scene } = useGLTF(`${import.meta.env.BASE_URL}Snow_Man.glb`)
    const model = useMemo(() => setupModel(scene), [scene])

    return (
        <group position={position}>
            {useStore(state => state.debugMode) && (
                <mesh position={[0, 0.75, 0]} material={debugMaterial}>
                    <boxGeometry args={[OBSTACLE_HITBOX.width, 1.5, OBSTACLE_HITBOX.depth]} />
                </mesh>
            )}
            <Center top>
                <primitive object={model} scale={1.5} rotation={[0, -Math.PI / 2, 0]} />
            </Center>
        </group>
    )
}

export function ForestSide({ position, rotation, ...props }) {
    const { scene: pine } = useGLTF(`${import.meta.env.BASE_URL}Pine_Tree_with_Snow.glb`)
    const { scene: snowTree } = useGLTF(`${import.meta.env.BASE_URL}Snow_Tree.glb`)

    const treeData = [
        { type: 'pine', pos: [0, 0, 0], scale: 10.5, rot: 0 },
        { type: 'snow', pos: [2, 5, -4], scale: 10.2, rot: 1.2 },
        { type: 'pine', pos: [-1, 0, 4], scale: 10.8, rot: 2.5 },
        { type: 'snow', pos: [6, 5, -2], scale: 10.5, rot: 3.1 },
        { type: 'pine', pos: [5, 0, 3], scale: 10.0, rot: 0.8 },
        { type: 'snow', pos: [7, 5, 6], scale: 10.2, rot: 4.5 },
        { type: 'pine', pos: [12, 0, -5], scale: 10.0, rot: 1.5 },
        { type: 'snow', pos: [15, 5, 0], scale: 12.0, rot: 5.2 },
        { type: 'pine', pos: [13, 0, 5], scale: 11.0, rot: 0.3 },
    ]

    const models = useMemo(() => treeData.map(t => ({
        ...t,
        clone: setupModel(t.type === 'pine' ? pine : snowTree)
    })), [pine, snowTree])

    return (
        <group position={position} rotation={rotation} {...props}>
            {models.map((m, i) => (
                <primitive
                    key={i}
                    object={m.clone}
                    scale={m.scale}
                    position={m.pos}
                    rotation={[0, m.rot, 0]}
                />
            ))}
        </group>
    )
}

export function CandySide({ position, rotation, ...props }) {
    const { scene: cane1 } = useGLTF(`${import.meta.env.BASE_URL}Candy_cane.glb`)
    const { scene: cane2 } = useGLTF(`${import.meta.env.BASE_URL}Candy_cane_(1).glb`)

    const caneData = [
        { type: 1, pos: [0, 0, 0], scale: 2.2, rot: 0.5 },
        { type: 2, pos: [3, 0, 2], scale: 2.5, rot: -0.3 },
        { type: 1, pos: [2, 0, -4], scale: 1.0, rot: 0.8 },
        { type: 2, pos: [6, 0, 0], scale: 2.5, rot: 1.2 },
        { type: 1, pos: [5, 0, 6], scale: 2.0, rot: -0.5 },
        { type: 2, pos: [10, 0, -3], scale: 4.0, rot: 0.2 },
        { type: 1, pos: [12, 0, 4], scale: 3.5, rot: 1.5 },
    ]

    const models = useMemo(() => caneData.map(c => ({
        ...c,
        clone: setupModel(c.type === 1 ? cane1 : cane2)
    })), [cane1, cane2])

    return (
        <group position={position} rotation={rotation} {...props}>
            {models.map((m, i) => (
                <primitive
                    key={i}
                    object={m.clone}
                    scale={m.scale}
                    position={m.pos}
                    rotation={[0, m.rot, 0]}
                />
            ))}
        </group>
    )
}

export function Rock({ position }) {
    return (
        <group position={position}>
            {useStore(state => state.debugMode) && (
                <mesh position={[0, 0.4, 0]} material={debugMaterial}>
                    <boxGeometry args={[OBSTACLE_HITBOX.width, 0.9, OBSTACLE_HITBOX.depth]} />
                </mesh>
            )}
            <mesh position={[0, 0.45, 0]} geometry={rockGeometry} material={snowMaterial} />
        </group>
    )
}

export function Gift({ position, collected, collectedAt }) {
    const { scene } = useGLTF(`${import.meta.env.BASE_URL}Present.glb`)
    const model = useMemo(() => setupModel(scene), [scene])
    const groupRef = useRef()

    useFrame((state) => {
        if (collected && collectedAt && groupRef.current) {
            const elapsed = (Date.now() - collectedAt) / 1000 // seconds
            const animDuration = 0.6

            if (elapsed < animDuration) {
                const progress = elapsed / animDuration
                // Float up
                groupRef.current.position.y = 0.5 + progress * 3
                // Spin
                groupRef.current.rotation.y = progress * Math.PI * 4
                // Scale down
                groupRef.current.scale.setScalar(1.5 * (1 - progress))
            } else {
                // Hide after animation
                groupRef.current.visible = false
            }
        }
    })

    return (
        <group ref={groupRef} position={[position[0], 0.5, position[2]]}>
            {useStore(state => state.debugMode) && !collected && (
                <mesh position={[0, 0, 0]} material={debugMaterial}>
                    <boxGeometry args={[GIFT_HITBOX.width, 1, GIFT_HITBOX.depth]} />
                </mesh>
            )}
            <Center>
                <primitive object={model} scale={1.5} />
            </Center>
            {/* Subtle glow for visibility at night */}
        </group>
    )
}

export function MountainPeakSide({ position, rotation, ...props }) {
    const { scene } = useGLTF(`${import.meta.env.BASE_URL}Mountain_with_Snow.glb`)
    const model = useMemo(() => setupModel(scene), [scene])

    return (
        <group position={position} rotation={rotation} {...props}>
            <Center>
                <primitive object={model} scale={65} />
            </Center>
        </group>
    )
}

export function CandyCaneArch({ position }) {
    const { scene } = useGLTF(`${import.meta.env.BASE_URL}Candy_cane_(1).glb`)
    const model = useMemo(() => setupModel(scene), [scene])

    return (
        <group position={position}>
            {useStore(state => state.debugMode) && (
                <mesh position={[0, ARCH_HITBOX.height / 2 + 1, 4]} material={debugMaterial}>
                    <boxGeometry args={[ARCH_HITBOX.width, 1, ARCH_HITBOX.depth]} />
                </mesh>
            )}
            <group position={[0, -6, 0]} rotation={[0, 0, 0]}>
                <primitive object={model} scale={2.25} />
            </group>
        </group >
    )
}

export function AbilityBox({ position }) {
    const { scene } = useGLTF(`${import.meta.env.BASE_URL}Present.glb`)
    const model = useMemo(() => setupModel(scene), [scene])
    const group = useRef()

    useFrame((state) => {
        if (group.current) {
            group.current.rotation.y += 0.05
            group.current.position.y = 2.5 + Math.sin(state.clock.elapsedTime * 4) * 0.2
        }
    })

    return (
        <group position={position}>
            {useStore(state => state.debugMode) && (
                <mesh position={[0, 2.5, 0]} material={debugMaterial}>
                    <boxGeometry args={[1, 1, 1]} />
                </mesh>
            )}

            <group ref={group} position={[0, 2.5, 0]}>
                <Center>
                    <primitive object={model} scale={0.7} />
                </Center>
            </group>
        </group>
    )
}

export function Shield({ position }) {
    return (
        <group position={position}>
            {useStore(state => state.debugMode) && (
                <mesh position={[0, 0.5, 0]} material={debugMaterial}>
                    <boxGeometry args={[1, 1, 1]} />
                </mesh>
            )}
            <mesh position={[0, 0.5, 0]} geometry={shieldGeometry} material={shieldMaterial} />
        </group>
    )
}

export function Magnet({ position }) {
    return (
        <group position={position}>
            {useStore(state => state.debugMode) && (
                <mesh position={[0, 0.5, 0]} material={debugMaterial}>
                    <boxGeometry args={[1, 1, 1]} />
                </mesh>
            )}
            <group position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <mesh position={[-0.2, 0, 0]} geometry={magnetCylinderGeometry} material={magnetRedMaterial} />
                <mesh position={[0.2, 0, 0]} geometry={magnetCylinderGeometry} material={magnetRedMaterial} />
                <mesh position={[0, 0.3, 0]} rotation={[0, 0, Math.PI / 2]} geometry={magnetCylinderSmallGeometry} material={magnetWhiteMaterial} />
            </group>
        </group>
    )
}

export function MountainSide({ position, rotation }) {
    const { scene } = useGLTF(`${import.meta.env.BASE_URL}Mountain.glb`)
    const model = useMemo(() => setupModel(scene), [scene])

    return (
        <group position={position} rotation={rotation}>
            {useStore(state => state.debugMode) && (
                <mesh position={[0, 10, 0]} material={debugMaterial}>
                    <boxGeometry args={[10, 20, 10]} />
                </mesh>
            )}
            <Center>
                <primitive object={model} scale={10} />
            </Center>
        </group>
    )
}

