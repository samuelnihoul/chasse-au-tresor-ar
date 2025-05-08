'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useZombies, updateGlobalPosition } from '../hooks/useZombies';

interface Zombie {
    id: string;
    x: number;
    y: number;
    latitude: number;
    longitude: number;
    speed: number;
    active: boolean;
    health: number;
    fixed: boolean;
}

interface GeoPosition {
    latitude: number;
    longitude: number;
}

const CameraFeed: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [shooting, setShooting] = useState(false);
    const animationFrameRef = useRef<number | null>(null);
    const lastUpdateRef = useRef<number>(0);
    const zombieImageRef = useRef<HTMLImageElement | null>(null);
    const [currentPosition, setCurrentPosition] = useState<GeoPosition | null>(null);
    const [deviceOrientation, setDeviceOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });

    // Précharger l'image du zombie
    useEffect(() => {
        const image = new Image();
        image.src = '/zom.png';
        zombieImageRef.current = image;
    }, []);

    // Utiliser le hook pour les zombies
    const { zombies, addZombie, damageZombie, removeZombie, score, updateZombiePositions } = useZombies();

    // Obtenir la position GPS et la partager globalement
    useEffect(() => {
        if (!navigator.geolocation) {
            console.warn("La géolocalisation n'est pas prise en charge par ce navigateur.");
            return;
        }

        // Position initiale immédiate si disponible
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                console.log("Position initiale obtenue:", latitude, longitude);

                // Mettre à jour à la fois l'état local et la position globale
                setCurrentPosition({ latitude, longitude });
                updateGlobalPosition(latitude, longitude);
            },
            (error) => console.warn("Erreur de géolocalisation initiale:", error),
            { enableHighAccuracy: true, timeout: 10000 }
        );

        // Surveillance continue de la position
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;

                // Mettre à jour à la fois l'état local et la position globale
                setCurrentPosition({ latitude, longitude });
                updateGlobalPosition(latitude, longitude);
            },
            (error) => {
                console.warn("Erreur de géolocalisation:", error);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000
            }
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, []);

    // Obtenir l'orientation de l'appareil
    useEffect(() => {
        const handleOrientation = (event: DeviceOrientationEvent) => {
            setDeviceOrientation({
                alpha: event.alpha || 0,
                beta: event.beta || 0,
                gamma: event.gamma || 0
            });
        };

        window.addEventListener('deviceorientation', handleOrientation);

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, []);

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

                // Pour les zombies fixes, calculer leur position à l'écran en fonction de la position GPS et de l'orientation
                if (zombie.fixed && currentPosition) {
                    // Calculer la distance et l'angle entre l'utilisateur et le zombie
                    const distance = calculateDistance(
                        currentPosition.latitude, currentPosition.longitude,
                        zombie.latitude, zombie.longitude
                    );

                    // Calculer l'angle par rapport au nord géographique
                    const bearing = calculateBearing(
                        currentPosition.latitude, currentPosition.longitude,
                        zombie.latitude, zombie.longitude
                    );

                    // Ajuster l'angle en fonction de l'orientation de l'appareil (alpha est la rotation autour de l'axe z)
                    const adjustedBearing = (bearing - deviceOrientation.alpha + 360) % 360;

                    // Convertir en radians
                    const bearingRad = (adjustedBearing * Math.PI) / 180;

                    // Facteur d'échelle pour la distance (ajuster selon vos besoins)
                    const scaleFactor = 1000;

                    // Calculer les coordonnées x et y à l'écran
                    // x positif vers la droite, y positif vers le bas
                    const screenX = canvas.width / 2 + Math.sin(bearingRad) * distance * scaleFactor;
                    const screenY = canvas.height / 2 - Math.cos(bearingRad) * distance * scaleFactor;

                    // Facteur de distance pour déterminer si le zombie est visible
                    const maxDistance = 1.0; // Augmenté à 1 km pour une meilleure visibilité

                    // Ne dessiner le zombie que s'il est assez proche
                    if (distance < maxDistance) {
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
                    }
                } else {
                    // Pour les zombies non fixes, utiliser l'ancienne méthode
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
                }
            });
        };

        animate(0);

        return () => {
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [zombies, updateZombiePositions, currentPosition, deviceOrientation]);

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
        const ZOMBIE_SPAWN_INTERVAL = 3000; // Réduit de 8000 à 3000 ms (3 secondes) pour plus de zombies

        // Ajouter 5 zombies initiaux au démarrage
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 0.5 + Math.random() * 0.5;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            addZombie(x, y);
        }

        const zombieInterval = setInterval(() => {
            // Créer un zombie à une position aléatoire autour de l'écran
            const angle = Math.random() * Math.PI * 2;
            const distance = 0.5 + Math.random() * 0.5; // Distance entre 0.5 et 1 unité
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;

            // Ajouter deux zombies à chaque intervalle au lieu d'un seul
            addZombie(x, y);

            // Ajouter un second zombie dans une direction légèrement différente
            const angle2 = (angle + Math.PI / 4) % (Math.PI * 2);
            const x2 = Math.cos(angle2) * distance;
            const y2 = Math.sin(angle2) * distance;
            addZombie(x2, y2);
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

        let hitZombie = false;

        // Vérifier les collisions avec les zombies fixes
        if (currentPosition) {
            zombies.forEach((zombie: Zombie) => {
                if (!zombie.active) return;

                if (zombie.fixed) {
                    // Calculer la position à l'écran du zombie
                    const distance = calculateDistance(
                        currentPosition.latitude, currentPosition.longitude,
                        zombie.latitude, zombie.longitude
                    );

                    const bearing = calculateBearing(
                        currentPosition.latitude, currentPosition.longitude,
                        zombie.latitude, zombie.longitude
                    );

                    const adjustedBearing = (bearing - deviceOrientation.alpha + 360) % 360;
                    const bearingRad = (adjustedBearing * Math.PI) / 180;

                    const scaleFactor = 1000;

                    const screenX = rect.width / 2 + Math.sin(bearingRad) * distance * scaleFactor;
                    const screenY = rect.height / 2 - Math.cos(bearingRad) * distance * scaleFactor;

                    // Distance de tir en pixels
                    const shotDistance = Math.sqrt(
                        Math.pow(clickX - screenX, 2) +
                        Math.pow(clickY - screenY, 2)
                    );

                    // Rayon de collision en pixels
                    const hitRadius = 30;

                    if (shotDistance < hitRadius && distance < 0.1) {
                        damageZombie(zombie.id, 50);
                        hitZombie = true;
                    }
                } else {
                    // Pour les zombies non fixes, utiliser l'ancienne méthode
                    const normalizedX = (clickX / rect.width) * 2 - 1;
                    const normalizedY = -((clickY / rect.height) * 2 - 1);

                    const distance = Math.sqrt(
                        Math.pow(normalizedX - zombie.x, 2) +
                        Math.pow(normalizedY - zombie.y, 2)
                    );

                    if (distance < 0.1) { // Rayon de collision
                        damageZombie(zombie.id, 50);
                        hitZombie = true;
                    }
                }
            });
        }

        // Effet visuel de tir
        setShooting(true);
        setTimeout(() => setShooting(false), 200);
    };

    // Fonction pour calculer la distance entre deux points GPS (en kilomètres)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Rayon de la Terre en km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Fonction pour calculer l'angle entre deux points GPS (en degrés)
    const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const dLon = deg2rad(lon2 - lon1);
        const y = Math.sin(dLon) * Math.cos(deg2rad(lat2));
        const x = Math.cos(deg2rad(lat1)) * Math.sin(deg2rad(lat2)) -
            Math.sin(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.cos(dLon);
        let brng = Math.atan2(y, x);
        brng = rad2deg(brng);
        return (brng + 360) % 360;
    };

    // Convertir degrés en radians
    const deg2rad = (deg: number): number => {
        return deg * (Math.PI / 180);
    };

    // Convertir radians en degrés
    const rad2deg = (rad: number): number => {
        return rad * (180 / Math.PI);
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
