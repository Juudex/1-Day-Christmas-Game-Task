import { Stars } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useStore } from '../store'
import * as THREE from 'three'

export function Environment() {
    const { timeOfDay, updateTime } = useStore()

    useFrame((state, delta) => {
        updateTime(delta)
    })

    const colors = {
        midnight: new THREE.Color('#02020a'),
        dawn: new THREE.Color('#ffb38a'),
        day: new THREE.Color('#87CEEB'),
        sunset: new THREE.Color('#FF7F50'),
    }

    let bgColor = new THREE.Color()
    let sunIntensity = 1
    let ambientIntensity = 0.8
    let starsOpacity = 0

    // Time Cycle Logic
    if (timeOfDay >= 0 && timeOfDay < 5) { // Night
        bgColor.copy(colors.midnight)
        sunIntensity = 0
        ambientIntensity = 0.2
        starsOpacity = 1
    } else if (timeOfDay >= 5 && timeOfDay < 9) { // Dawn
        const p = (timeOfDay - 5) / 4
        bgColor.copy(colors.midnight).lerp(colors.dawn, p)
        sunIntensity = p * 0.8
        ambientIntensity = 0.2 + p * 0.5
        starsOpacity = 1 - p
    } else if (timeOfDay >= 9 && timeOfDay < 12) { // Morning
        const p = (timeOfDay - 9) / 3
        bgColor.copy(colors.dawn).lerp(colors.day, p)
        sunIntensity = 0.8 + p * 0.4
        ambientIntensity = 0.7 + p * 0.2
        starsOpacity = 0
    } else if (timeOfDay >= 12 && timeOfDay < 17) { // Day
        bgColor.copy(colors.day)
        sunIntensity = 1.2
        ambientIntensity = 0.9
        starsOpacity = 0
    } else if (timeOfDay >= 17 && timeOfDay < 21) { // Sunset
        const p = (timeOfDay - 17) / 4
        bgColor.copy(colors.day).lerp(colors.sunset, p)
        sunIntensity = 1.2 - p * 0.8
        ambientIntensity = 0.9 - p * 0.4
        starsOpacity = 0
    } else { // 21 to 24 (Nightfall)
        const p = (timeOfDay - 21) / 3
        bgColor.copy(colors.sunset).lerp(colors.midnight, p)
        sunIntensity = 0.4 * (1 - p)
        ambientIntensity = 0.5 - p * 0.3
        starsOpacity = p
    }

    // Move sun based on time
    const sunAngle = (timeOfDay / 24) * Math.PI * 2 - Math.PI / 2
    const sunX = Math.cos(sunAngle) * 20
    const sunY = Math.sin(sunAngle) * 20

    return (
        <>
            <color attach="background" args={[bgColor]} />
            <fog attach="fog" args={[bgColor, 10, 60]} />

            <ambientLight intensity={ambientIntensity} color="#ffffff" />
            <directionalLight
                position={[sunX, sunY, 10]}
                intensity={sunIntensity}
                castShadow
                shadow-mapSize={[1024, 1024]}
                shadow-camera-left={-20}
                shadow-camera-right={20}
                shadow-camera-top={20}
                shadow-camera-bottom={-20}
                shadow-bias={-0.001}
            />

            {starsOpacity > 0.01 && (
                <>
                    <Stars
                        radius={100}
                        depth={50}
                        count={2000}
                        factor={4}
                        saturation={0}
                        fade
                        speed={1}
                    />
                    {/* Aurora Borealis Effect */}
                    <Stars
                        radius={60}
                        depth={10}
                        count={500}
                        factor={6}
                        saturation={1}
                        fade
                        speed={0.5}
                    />
                    <pointLight position={[0, 20, -50]} intensity={10} color="#00ffaa" distance={100} />
                </>
            )}
        </>
    )
}
