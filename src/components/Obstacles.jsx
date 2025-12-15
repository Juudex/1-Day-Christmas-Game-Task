import { useGLTF, Center } from '@react-three/drei'
import { useStore } from '../store'

export function Tree({ position }) {
    const { scene: cane } = useGLTF('/Candy cane (1).glb')
    return (
        <group position={position}>
            {/* Debug Hitbox: The logic checks distance < 0.8, so depth is 1.6 */}
            {useStore(state => state.debugMode) && (
                <mesh position={[0, 1, 0]}>
                    <boxGeometry args={[1, 2, 1.6]} />
                    <meshStandardMaterial color="red" wireframe transparent opacity={0.5} />
                </mesh>
            )}

            {/* Visual Model - Centered, Raised More, Shifted Left */}
            <group position={[-0.9, 2.5, 0]}>
                <Center>
                    <primitive object={cane.clone()} scale={1.5} />
                </Center>
            </group>
        </group>
    )
}

export function Rock({ position }) {
    // Use Snow Man as the "Rock" obstacle (another obstacle type)
    const { scene } = useGLTF('/Snow Man.glb')
    return (
        <group position={position}>
            {useStore(state => state.debugMode) && (
                <mesh position={[0, 0.75, 0]}>
                    <boxGeometry args={[1, 1.5, 1.6]} />
                    <meshStandardMaterial color="red" wireframe transparent opacity={0.5} />
                </mesh>
            )}
            <Center top>
                <primitive object={scene.clone()} scale={1.5} rotation={[0, -Math.PI / 2, 0]} />
            </Center>
        </group>
    )
}

export function Gift({ position }) {
    const { scene } = useGLTF('/Present.glb')
    return (
        <group position={[position[0], 0.5, position[2]]}>
            {/* Debug Box */}
            {useStore(state => state.debugMode) && (
                <mesh position={[0, 0, 2]}>
                    <boxGeometry args={[1, 1, 1.6]} />
                    <meshStandardMaterial color="yellow" wireframe transparent opacity={0.5} />
                </mesh>
            )}
            <Center>
                <primitive object={scene.clone()} scale={1.5} />
            </Center>
        </group>
    )
}

export function MountainSide({ position, rotation }) {
    const { scene } = useGLTF('/Mountain.glb')
    return (
        <group position={position} rotation={rotation}>
            {/* Debug Box */}
            {useStore(state => state.debugMode) && (
                <mesh position={[0, 10, 0]}>
                    <boxGeometry args={[10, 20, 10]} />
                    <meshStandardMaterial color="blue" wireframe transparent opacity={0.5} />
                </mesh>
            )}
            <Center>
                <primitive object={scene.clone()} scale={10} />
            </Center>
        </group>
    )
}
