'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useZombies } from '../hooks/useZombies';
import { useHints } from '../hooks/useHints';
import * as THREE from 'three';

const CameraFeed: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [shooting, setShooting] = useState(false);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const zombieModelsRef = useRef<Map<string, THREE.Mesh>>(new Map());
    const animationFrameRef = useRef<number | null>(null);
    
    // Utiliser les hooks pour les zombies et les indices
    const { zombies, addZombie, damageZombie, removeZombie, score } = useZombies();
    const { distanceToNextHint } = useHints();

    // Initialiser la scène Three.js
    useEffect(() => {
        if (!canvasRef.current) return;

        // Créer la scène
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Créer la caméra
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;
        cameraRef.current = camera;

        // Créer le renderer
        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            alpha: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        rendererRef.current = renderer;

        // Ajouter une lumière ambiante
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        // Ajouter une lumière directionnelle
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 1, 1);
        scene.add(directionalLight);

        // Fonction d'animation
        const animate = () => {
            animationFrameRef.current = requestAnimationFrame(animate);
            
            // Mettre à jour les positions des zombies
            zombies.forEach(zombie => {
                const zombieModel = zombieModelsRef.current.get(zombie.id);
                if (zombieModel && zombie.active) {
                    // Déplacer le zombie vers le centre de l'écran
                    const targetX = 0;
                    const targetY = 0;
                    const dx = targetX - zombieModel.position.x;
                    const dy = targetY - zombieModel.position.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance > 0.1) {
                        zombieModel.position.x += (dx / distance) * zombie.speed * 0.01;
                        zombieModel.position.y += (dy / distance) * zombie.speed * 0.01;
                    }
                    
                    // Faire tourner le zombie
                    zombieModel.rotation.y += 0.01;
                }
            });
            
            renderer.render(scene, camera);
        };
        
        animate();

        // Nettoyer
        return () => {
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            
            // Supprimer tous les modèles de zombies
            zombieModelsRef.current.forEach((model) => {
                scene.remove(model);
                if (model.geometry) model.geometry.dispose();
                if (model.material) {
                    if (Array.isArray(model.material)) {
                        model.material.forEach(material => material.dispose());
                    } else {
                        model.material.dispose();
                    }
                }
            });
            
            zombieModelsRef.current.clear();
            
            // Nettoyer le renderer
            renderer.dispose();
        };
    }, [zombies]);

    // Gérer le redimensionnement de la fenêtre
    useEffect(() => {
        const handleResize = () => {
            if (videoRef.current && canvasRef.current && rendererRef.current && cameraRef.current) {
                const width = window.innerWidth;
                const height = window.innerHeight;
                setDimensions({ width, height });
                
                rendererRef.current.setSize(width, height);
                cameraRef.current.aspect = width / height;
                cameraRef.current.updateProjectionMatrix();
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Démarrer la caméra
    useEffect(() => {
        const startVideo = async () => {
            if (videoRef.current) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            facingMode: { ideal: 'environment' }, // Utilise la caméra arrière
                            width: { ideal: 1920 },
                            height: { ideal: 1080 }
                        }
                    });
                    videoRef.current.srcObject = stream;
                } catch (error) {
                    console.error("Erreur d'accès à la caméra :", error);
                }
            }
        };

        startVideo();

        return () => {
            // Arrêter le flux vidéo lors de la désinstallation du composant
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    // Ajouter des zombies périodiquement en fonction de la distance au prochain indice
    useEffect(() => {
        if (!distanceToNextHint) return;
        
        // Plus on est proche de l'indice, plus il y a de zombies
        const zombieFrequency = Math.max(5000, 15000 - (15000 * (1 - distanceToNextHint / 1000)));
        
        const zombieInterval = setInterval(() => {
            if (sceneRef.current) {
                // Créer un zombie à une position aléatoire autour de l'écran
                const angle = Math.random() * Math.PI * 2;
                const distance = 3 + Math.random() * 2; // Distance entre 3 et 5 unités
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;
                
                addZombie(x, y);
                
                // Créer un modèle 3D simple pour le zombie
                const geometry = new THREE.BoxGeometry(0.5, 1, 0.2);
                const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
                const zombie = new THREE.Mesh(geometry, material);
                zombie.position.set(x, y, 0);
                
                // Ajouter le zombie à la scène
                sceneRef.current.add(zombie);
                
                // Stocker une référence au modèle
                const zombieId = zombies[zombies.length - 1]?.id;
                if (zombieId) {
                    zombieModelsRef.current.set(zombieId, zombie);
                }
            }
        }, zombieFrequency);
        
        return () => {
            clearInterval(zombieInterval);
        };
    }, [addZombie, distanceToNextHint, zombies]);

    // Gérer le tir sur les zombies
    const handleShoot = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!canvasRef.current || !sceneRef.current || !cameraRef.current) return;
        
        // Calculer les coordonnées normalisées du clic (-1 à 1)
        const rect = canvasRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Créer un rayon depuis la caméra
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);
        
        // Vérifier les intersections avec les zombies
        const zombieModels = Array.from(zombieModelsRef.current.values());
        const intersects = raycaster.intersectObjects(zombieModels);
        
        if (intersects.length > 0) {
            // Trouver l'ID du zombie touché
            let zombieId: string | null = null;
            zombieModelsRef.current.forEach((model, id) => {
                if (model === intersects[0].object) {
                    zombieId = id;
                }
            });
            
            if (zombieId) {
                // Infliger des dégâts au zombie
                damageZombie(zombieId, 50);
                
                // Effet visuel de tir
                setShooting(true);
                setTimeout(() => setShooting(false), 200);
                
                // Si le zombie est mort, le supprimer de la scène
                const zombie = zombies.find(z => z.id === zombieId);
                if (zombie && !zombie.active) {
                    const model = zombieModelsRef.current.get(zombieId);
                    if (model && sceneRef.current) {
                        sceneRef.current.remove(model);
                        zombieModelsRef.current.delete(zombieId);
                        removeZombie(zombieId);
                    }
                }
            }
        }
        
        // Effet visuel de tir même si aucun zombie n'est touché
        setShooting(true);
        setTimeout(() => setShooting(false), 200);
    };

    return (
        <div className='relative flex justify-center items-center'>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                    width: '100%',
                    height: '100vh',
                    objectFit: 'cover',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            />
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none'
                }}
            />
            <div 
                className="absolute top-0 left-0 w-full h-full"
                onClick={handleShoot}
            >
                {/* Viseur */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className={`w-10 h-10 border-2 rounded-full ${shooting ? 'border-red-500' : 'border-white'} flex items-center justify-center`}>
                        <div className={`w-2 h-2 rounded-full ${shooting ? 'bg-red-500' : 'bg-white'}`}></div>
                    </div>
                </div>
                
                {/* Score */}
                <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
                    <p className="font-bold">Score: {score}</p>
                </div>
                
                {/* Effet de tir */}
                {shooting && (
                    <div className="absolute top-0 left-0 w-full h-full bg-red-500 bg-opacity-10"></div>
                )}
            </div>
        </div>
    );
};

export default CameraFeed;
