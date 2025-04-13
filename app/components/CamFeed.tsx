'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useZombies } from '../hooks/useZombies';

interface Zombie {
    id: string;
    x: number;
    y: number;
    speed: number;
    active: boolean;
    health: number;
}

const CameraFeed: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [shooting, setShooting] = useState(false);
    const animationFrameRef = useRef<number | null>(null);
    const lastUpdateRef = useRef<number>(0);
    const zombieImageRef = useRef<HTMLImageElement | null>(null);

    // Précharger l'image du zombie
    useEffect(() => {
        const image = new Image();
        image.src = '/zom.png';
        zombieImageRef.current = image;
    }, []);

    // Utiliser le hook pour les zombies
    const { zombies, addZombie, damageZombie, removeZombie, score, updateZombiePositions } = useZombies();

    // Initialiser le canvas
    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Ajuster la taille du canvas
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Fonction d'animation
        const animate = (timestamp: number) => {
            animationFrameRef.current = requestAnimationFrame(animate);

            // Mettre à jour les positions des zombies toutes les 50ms (20 fois par seconde)
            if (timestamp - lastUpdateRef.current > 50) {
                updateZombiePositions();
                lastUpdateRef.current = timestamp;
            }

            // Effacer le canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Dessiner les zombies
            zombies.forEach((zombie: Zombie) => {
                if (!zombie.active) return;

                // Calculer la position du zombie sur l'écran
                const screenX = (zombie.x + 1) * (canvas.width / 2);
                const screenY = (-zombie.y + 1) * (canvas.height / 2);

                // Dessiner le zombie
                const zombieImage = zombieImageRef.current;
                if (zombieImage) {
                    const zombieSize = 40; // Taille de l'image du zombie
                    ctx.drawImage(zombieImage, screenX - zombieSize / 2, screenY - zombieSize / 2, zombieSize, zombieSize);
                }

                // Barre de vie
                const healthBarWidth = 40;
                const healthBarHeight = 4;
                const healthPercentage = zombie.health / 100;

                ctx.fillStyle = '#ff0000';
                ctx.fillRect(screenX - healthBarWidth / 2, screenY - 30, healthBarWidth, healthBarHeight);

                ctx.fillStyle = '#00ff00';
                ctx.fillRect(screenX - healthBarWidth / 2, screenY - 30, healthBarWidth * healthPercentage, healthBarHeight);
            });
        };

        animate(0);

        return () => {
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [zombies, updateZombiePositions]);

    // Démarrer la caméra
    useEffect(() => {
        const startVideo = async () => {
            if (videoRef.current) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            facingMode: { ideal: 'environment' },
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
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                const tracks = stream.getTracks();
                tracks.forEach(track => track.stop());
            }
        };
    }, []);

    // Ajouter des zombies périodiquement
    useEffect(() => {
        const ZOMBIE_SPAWN_INTERVAL = 8000; // 8 secondes

        const zombieInterval = setInterval(() => {
            // Créer un zombie à une position aléatoire autour de l'écran
            const angle = Math.random() * Math.PI * 2;
            const distance = 0.5 + Math.random() * 0.5; // Distance entre 0.5 et 1 unité
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;

            addZombie(x, y);
        }, ZOMBIE_SPAWN_INTERVAL);

        return () => {
            clearInterval(zombieInterval);
        };
    }, [addZombie]);

    // Gérer le tir sur les zombies
    const handleShoot = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Convertir les coordonnées de l'écran en coordonnées normalisées (-1 à 1)
        const normalizedX = (clickX / rect.width) * 2 - 1;
        const normalizedY = -((clickY / rect.height) * 2 - 1);

        // Vérifier les collisions avec les zombies
        zombies.forEach((zombie: Zombie) => {
            if (!zombie.active) return;

            const distance = Math.sqrt(
                Math.pow(normalizedX - zombie.x, 2) +
                Math.pow(normalizedY - zombie.y, 2)
            );

            if (distance < 0.1) { // Rayon de collision
                damageZombie(zombie.id, 50);

                if (zombie.health <= 0) {
                    removeZombie(zombie.id);
                }

                setShooting(true);
                setTimeout(() => setShooting(false), 200);
            }
        });

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
