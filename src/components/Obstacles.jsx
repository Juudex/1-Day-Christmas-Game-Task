import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Center, Clone } from '@react-three/drei'
import { useStore } from '../store'
import { OBSTACLE_HITBOX, GIFT_HITBOX, ARCH_HITBOX, LANE_WIDTH } from '../constants'

export function Snowman({ position }) {
    const { scene } = useGLTF('/Snow_Man.glb')

    return (
        <group position={position}>
            {useStore(state => state.debugMode) && (
                <mesh position={[0, 0.75, 0]}>
                    <boxGeometry args={[OBSTACLE_HITBOX.width, 1.5, OBSTACLE_HITBOX.depth]} />
                    <meshStandardMaterial color="red" wireframe transparent opacity={0.5} />
                </mesh>
            )}
            <Center top>
                <Clone object={scene} scale={1.5} rotation={[0, -Math.PI / 2, 0]} />
            </Center>
        </group>
    )
}

export function ForestSide({ position, rotation, ...props }) {
    const { scene: pine } = useGLTF('/Pine_Tree_with_Snow.glb')
    const { scene: snowTree } = useGLTF('/Snow_Tree.glb')

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

    return (
        <group position={position} rotation={rotation} {...props}>
            {treeData.map((t, i) => (
                <Clone
                    key={i}
                    object={t.type === 'pine' ? pine : snowTree}
                    scale={t.scale}
                    position={t.pos}
                    rotation={[0, t.rot, 0]}
                />
            ))}
        </group>
    )
}

export function CandySide({ position, rotation, ...props }) {
    const { scene: cane1 } = useGLTF('/Candy_cane.glb')
    const { scene: cane2 } = useGLTF('/Candy_cane_(1).glb')

    const caneData = [
        { type: 1, pos: [0, 0, 0], scale: 2.2, rot: 0.5 },
        { type: 2, pos: [3, 0, 2], scale: 2.5, rot: -0.3 },
        { type: 1, pos: [2, 0, -4], scale: 1.0, rot: 0.8 },
        { type: 2, pos: [6, 0, 0], scale: 2.5, rot: 1.2 },
        { type: 1, pos: [5, 0, 6], scale: 2.0, rot: -0.5 },
        { type: 2, pos: [10, 0, -3], scale: 4.0, rot: 0.2 },
        { type: 1, pos: [12, 0, 4], scale: 3.5, rot: 1.5 },
    ]

    return (
        <group position={position} rotation={rotation} {...props}>
            {caneData.map((c, i) => (
                <Clone
                    key={i}
                    object={c.type === 1 ? cane1 : cane2}
                    scale={c.scale}
                    position={c.pos}
                    rotation={[0, c.rot, 0]}
                />
            ))}
        </group>
    )
}

export function Rock({ position }) {
    // Simple Rock mesh as we don't have a GLB for it
    return (
        <group position={position}>
            {useStore(state => state.debugMode) && (
                <mesh position={[0, 0.4, 0]}>
                    <boxGeometry args={[OBSTACLE_HITBOX.width, 0.9, OBSTACLE_HITBOX.depth]} />
                    <meshStandardMaterial color="orange" wireframe transparent opacity={0.5} />
                </mesh>
            )}
            <mesh position={[0, 0.45, 0]}>
                <dodecahedronGeometry args={[1.5, 0]} />
                <meshStandardMaterial color="#fff" roughness={0.8} />
            </mesh>
        </group>
    )
}

export function Gift({ position }) {
    const { scene } = useGLTF('/Present.glb')

    return (
        <group position={[position[0], 0.5, position[2]]}>
            {useStore(state => state.debugMode) && (
                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[GIFT_HITBOX.width, 1, GIFT_HITBOX.depth]} />
                    <meshStandardMaterial color="yellow" wireframe transparent opacity={0.5} />
                </mesh>
            )}
            <Center>
                <Clone object={scene} scale={1.5} />
            </Center>
            <pointLight intensity={2} color="#ffd700" distance={4} />
        </group>
    )
}

export function MountainPeakSide({ position, rotation, ...props }) {
    const { scene } = useGLTF('/Mountain_with_Snow.glb')

    return (
        <group position={position} rotation={rotation} {...props}>
            <Center>
                <Clone object={scene} scale={65} />
            </Center>
        </group>
    )
}

export function CandyCaneArch({ position }) {
    const { scene } = useGLTF('/Candy_cane_(1).glb')

    return (
        <group position={position}>
            {useStore(state => state.debugMode) && (
                <mesh position={[0, ARCH_HITBOX.height / 2 + 1, 0]}>
                    <boxGeometry args={[ARCH_HITBOX.width, 1, ARCH_HITBOX.depth]} />
                    <meshStandardMaterial color="purple" wireframe transparent opacity={0.5} />
                </mesh>
            )}
            <group position={[0, -3.5, 0]} rotation={[0, 0, 0]}>
                <Clone object={scene} scale={1.5} />
            </group>
        </group >
    )
}

export function AbilityBox({ position }) {
    const { scene } = useGLTF('/Present.glb')
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
                <mesh position={[0, 2.5, 0]}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="cyan" wireframe transparent opacity={0.5} />
                </mesh>
            )}
            <group ref={group} position={[0, 2.5, 0]}>
                <Center>
                    <Clone object={scene} scale={0.7} />
                </Center>
                <pointLight intensity={2} color="cyan" distance={3} />
            </group>
        </group>
    )
}

export function Shield({ position }) {
    return (
        <group position={position}>
            {useStore(state => state.debugMode) && (
                <mesh position={[0, 0.5, 0]}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="blue" wireframe transparent opacity={0.5} />
                </mesh>
            )}
            <mesh position={[0, 0.5, 0]} castShadow>
                <octahedronGeometry args={[0.5, 0]} />
                <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={1} />
            </mesh>
        </group>
    )
}

export function Magnet({ position }) {
    return (
        <group position={position}>
            {useStore(state => state.debugMode) && (
                <mesh position={[0, 0.5, 0]}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="red" wireframe transparent opacity={0.5} />
                </mesh>
            )}
            {/* Simple Magnet shape */}
            <group position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <mesh position={[-0.2, 0, 0]}>
                    <cylinderGeometry args={[0.1, 0.1, 0.6]} />
                    <meshStandardMaterial color="red" />
                </mesh>
                <mesh position={[0.2, 0, 0]}>
                    <cylinderGeometry args={[0.1, 0.1, 0.6]} />
                    <meshStandardMaterial color="red" />
                </mesh>
                <mesh position={[0, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.1, 0.1, 0.4]} />
                    <meshStandardMaterial color="white" />
                </mesh>
            </group>
        </group>
    )
}

export function MountainSide({ position, rotation }) {
    const { scene } = useGLTF('/Mountain.glb')

    return (
        <group position={position} rotation={rotation}>
            {useStore(state => state.debugMode) && (
                <mesh position={[0, 10, 0]}>
                    <boxGeometry args={[10, 20, 10]} />
                    <meshStandardMaterial color="blue" wireframe transparent opacity={0.5} />
                </mesh>
            )}
            <Center>
                <Clone object={scene} scale={10} />
            </Center>
        </group>
    )
}
