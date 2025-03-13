import { Canvas } from '@react-three/fiber'
import { XR, Interactive, XRButton } from '@react-three/xr'
import { Environment } from '@react-three/drei'

export default function ARScene() {
    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            <XRButton
                mode="AR"
                sessionInit={{
                    optionalFeatures: ['hit-test', 'dom-overlay'],
                    domOverlay: { root: document.body }
                }}
                style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    padding: '1rem 2rem',
                    background: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Activer la Réalité Augmentée
            </XRButton>

            <Canvas camera={{ position: [0, 0, 3] }}>
                <XR>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    <Environment preset="sunset" />

                    <Interactive onSelect={() => console.log('Interaction!')}>
                        <mesh position={[0, 0.1, -1]}>
                            <boxGeometry args={[0.1, 0.1, 0.1]} />
                            <meshStandardMaterial color="hotpink" />
                        </mesh>
                    </Interactive>
                </XR>
            </Canvas>
        </div>
    )
}