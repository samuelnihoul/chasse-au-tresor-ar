'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useHints, calculateDistance } from '../hooks/useHints';
import ZombieBattle from './ZombieBattle';

interface Location {
    latitude: number | null;
    longitude: number | null;
    timestamp?: number;
}

interface Hint {
    id: number;
    latitude: number;
    longitude: number;
    createdAt: string;
    hintNumber: number;
    hint: string;
    gameMap: string;
    zoneId: string;
}

const UserLocation: React.FC = () => {
    const [location, setLocation] = useState<Location>({ latitude: null, longitude: null });
    const [startPosition, setStartPosition] = useState<Location | null>(null);
    const [isNearHint, setIsNearHint] = useState<boolean>(false);
    const [caloriesBurned, setCaloriesBurned] = useState<number>(0);
    const [showHintModal, setShowHintModal] = useState<boolean>(false);
    const [modalHint, setModalHint] = useState<Hint | null>(null);
    const [arrowRotation, setArrowRotation] = useState<number>(0);
    const [speed, setSpeed] = useState<number>(0);
    const [showZombieBattle, setShowZombieBattle] = useState<boolean>(false);
    const lastLocationRef = useRef<Location | null>(null);
    const startPositionRef = useRef<Location | null>(null);
    const isNearHintRef = useRef<boolean>(false);
    const deviceHeadingRef = useRef<number>(0);
    const targetBearingRef = useRef<number | null>(null);

    // Constante pour le calcul des calories (60 calories par km de marche)
    const CALORIES_PER_KM = 60;

    // Utiliser le hook useHints pour gérer les indices
    const {
        setHints,
        getCurrentHint,
        getNextHint,
        nextHint,
        distanceToNextHint,
        setDistanceToNextHint
    } = useHints();

    // Seuil de proximité pour considérer qu'un utilisateur a atteint un indice (en mètres)
    const PROXIMITY_THRESHOLD = 20;

    // Seuil de vitesse minimum (7 km/h)
    const MIN_SPEED_THRESHOLD = 7;

    // Fonction pour calculer l'angle entre deux points
    const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const toRad = (deg: number) => deg * (Math.PI / 180);
        const toDeg = (rad: number) => rad * (180 / Math.PI);

        const φ1 = toRad(lat1);
        const φ2 = toRad(lat2);
        const λ1 = toRad(lon1);
        const λ2 = toRad(lon2);

        const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
        const x = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
        let θ = Math.atan2(y, x);
        θ = toDeg(θ);
        return (θ + 360) % 360;
    };

    // Charger les indices depuis l'API
    useEffect(() => {
        const fetchHints = async () => {
            try {
                const response = await fetch('/api/store-coordinates');
                const data = await response.json();
                // Filtrer les données pour ne garder que les indices valides
                const validHints = data.filter((hint: any) =>
                    hint.hintNumber >= 0 &&
                    hint.hint !== "pas encore défini"
                );

                // Définir les indices sans activer automatiquement le premier
                setHints(validHints);

                // Note: Aucune logique spéciale pour activer le premier indice
                // L'utilisateur devra se déplacer vers le premier indice comme les autres
            } catch (error) {
                console.error('Error fetching hints:', error);
            }
        };

        fetchHints();
        const interval = setInterval(fetchHints, 10000); // Rafraîchir les indices toutes les 10 secondes
        return () => clearInterval(interval);
    }, [setHints]);

    // Effet pour obtenir l'orientation de l'appareil (boussole)
    useEffect(() => {
        const handleOrientation = (event: DeviceOrientationEvent) => {
            const eventWithCompass = event as DeviceOrientationEvent & { webkitCompassHeading?: number };

            let heading: number | null = null;

            // iOS Safari
            if (typeof eventWithCompass.webkitCompassHeading === 'number') {
                heading = eventWithCompass.webkitCompassHeading;
            }
            // Android / autres navigateurs
            else if (event.alpha !== null) {
                heading = 360 - event.alpha;
            }

            if (heading !== null && !Number.isNaN(heading)) {
                deviceHeadingRef.current = (heading + 360) % 360;

                if (targetBearingRef.current !== null) {
                    const relativeRotation = (targetBearingRef.current - deviceHeadingRef.current + 360) % 360;
                    setArrowRotation(relativeRotation);
                }
            }
        };

        window.addEventListener('deviceorientationabsolute', handleOrientation, true);
        window.addEventListener('deviceorientation', handleOrientation, true);

        return () => {
            window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
            window.removeEventListener('deviceorientation', handleOrientation, true);
        };
    }, []);

    // Effet pour la géolocalisation
    useEffect(() => {
        if (!navigator.geolocation) {
            alert("La géolocalisation n'est pas supportée par ce navigateur.");
            return;
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const currentTime = Date.now();

                const previousLocation = lastLocationRef.current;
                if (previousLocation && previousLocation.latitude !== null && previousLocation.longitude !== null) {
                    const distance = calculateDistance(
                        previousLocation.latitude,
                        previousLocation.longitude,
                        latitude,
                        longitude
                    );
                    const timeDiff = (currentTime - (previousLocation.timestamp || currentTime)) / 1000;
                    if (timeDiff > 0) {
                        setSpeed((distance / timeDiff) * 3.6);
                    }
                }

                const newLocation = { latitude, longitude, timestamp: currentTime };
                setLocation(newLocation);
                lastLocationRef.current = newLocation;

                if (!startPositionRef.current) {
                    startPositionRef.current = newLocation;
                    setStartPosition(newLocation);
                }

                if (startPositionRef.current?.latitude !== null && startPositionRef.current?.longitude !== null) {
                    const distanceFromStart = calculateDistance(
                        startPositionRef.current.latitude,
                        startPositionRef.current.longitude,
                        latitude,
                        longitude
                    );
                    setCaloriesBurned(Math.round((distanceFromStart / 1000) * CALORIES_PER_KM));
                }

                const nextHintConst = getNextHint();
                if (nextHintConst) {
                    const distance = calculateDistance(
                        latitude,
                        longitude,
                        nextHintConst.latitude,
                        nextHintConst.longitude
                    );
                    setDistanceToNextHint(distance);

                    const bearing = calculateBearing(
                        latitude,
                        longitude,
                        nextHintConst.latitude,
                        nextHintConst.longitude
                    );
                    targetBearingRef.current = bearing;
                    const relativeRotation = (bearing - deviceHeadingRef.current + 360) % 360;
                    setArrowRotation(relativeRotation);

                    if (distance < PROXIMITY_THRESHOLD) {
                        setIsNearHint(true);
                        if (!isNearHintRef.current) {
                            setModalHint(nextHintConst);
                            
                            // Special case for hint #2 - show zombie battle!
                            if (nextHintConst.hintNumber === 2) {
                                setShowZombieBattle(true);
                            } else {
                                setShowHintModal(true);
                                nextHint();
                            }
                        }
                        isNearHintRef.current = true;
                    } else {
                        setIsNearHint(false);
                        isNearHintRef.current = false;
                    }
                } else {
                    setDistanceToNextHint(null);
                    targetBearingRef.current = null;
                    setIsNearHint(false);
                    isNearHintRef.current = false;
                }
            },
            (error) => {
                console.error('Error getting location:', error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 1000
            }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [getNextHint, nextHint, setDistanceToNextHint]);

    // Obtenir l'indice actuel
    const currentHint = getCurrentHint();
    const nextHintObj = getNextHint();

    const handleZombieBattleComplete = () => {
        setShowZombieBattle(false);
        setShowHintModal(true);
        nextHint();
    };

    return (
        <div className="bg-opacity-0 rounded-lg p-4 text-white">
            {/* Modal pour le nouvel indice */}
            {showHintModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-purple-900 p-6 rounded-lg max-w-md w-full mx-4">
                        {modalHint && (
                            <>
                                {modalHint.hintNumber === 0 && (
                                    <h3 className="text-xl font-bold mb-4 text-center text-yellow-400">
                                        Bienvenue dans la chasse au trésor!
                                    </h3>
                                )}
                                {modalHint.hint === "FIN" ? (
                                    <>
                                        <h3 className="text-xl font-bold mb-4 text-center text-green-400">
                                            Félicitations! 🎉
                                        </h3>
                                        <p className="text-center mb-4">
                                            Vous avez terminé la chasse au trésor!
                                        </p>
                                        <p className="text-center mb-4">
                                            Calories brûlées: {caloriesBurned} kcal
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <h3 className="text-xl font-bold mb-4">Nouvel indice atteint!</h3>
                                        <p className="mb-2">Indice #{modalHint.hintNumber}:</p>
                                        <p className="mb-4">{modalHint.hint}</p>
                                        <p className="text-sm mb-4">Carte: {modalHint.gameMap}</p>
                                    </>
                                )}
                                <button
                                    onClick={() => {
                                        setShowHintModal(false);
                                        setModalHint(null);
                                    }}
                                    className="bg-purple-700 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded w-full"
                                >
                                    Fermer
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Zombie Battle Modal */}
            {showZombieBattle && modalHint && (
                <ZombieBattle 
                    onComplete={handleZombieBattleComplete}
                    hint={modalHint.hint}
                />
            )}

            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Coordonnées de l'utilisateur</h2>
                {nextHintObj && (
                    <div className="relative w-8 h-8">
                        <div
                            className="absolute inset-0 transition-transform duration-300"
                            style={{ transform: `rotate(${arrowRotation}deg)` }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-full h-full text-white"
                            >
                                <path d="M12 2v20M12 2l8 8M12 2L4 10" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>
            {location.latitude !== null && location.longitude !== null ? (
                <>
                    <p>Latitude : {location.latitude.toFixed(6)}°</p>
                    <p>Longitude : {location.longitude.toFixed(6)}°</p>
                    <p className="mt-2">
                        Vitesse : {speed.toFixed(1)} km/h
                        {speed > 0 && speed < MIN_SPEED_THRESHOLD && (
                            <span className="text-yellow-400 ml-2">
                                ⚠️ Vous marchez trop lentement!
                            </span>
                        )}
                    </p>

                    {startPosition && (
                        <div className="mt-2">
                            <p className="font-semibold">Distance jusqu'au prochain indice :</p>
                            {nextHintObj && distanceToNextHint !== null ? (
                                <p className={(distanceToNextHint < 50) ? "text-green-400 font-bold" : "text-white"}>
                                    {(distanceToNextHint < 1000)
                                        ? `${distanceToNextHint.toFixed(0)} m`
                                        : `${(distanceToNextHint / 1000).toFixed(2)} km`}
                                    {distanceToNextHint < 50 && (
                                        <span className="ml-2 animate-pulse">🎯</span>
                                    )}
                                </p>
                            ) : (
                                <p className="text-gray-400">Recherche du prochain indice...</p>
                            )}
                        </div>
                    )}

                    {currentHint && (
                        <div className="mt-2 p-2 bg-purple-900 bg-opacity-50 rounded">
                            <p className="font-bold">Indice atteint ({currentHint.hintNumber}):</p>
                            <p>{currentHint.hint}</p>
                            <p className="text-sm">Carte: {currentHint.gameMap}</p>
                        </div>
                    )}

                    {nextHintObj && distanceToNextHint !== null && (
                        <div className="mt-2">
                            <p className="font-semibold">Prochain indice: #{nextHintObj.hintNumber}</p>
                            <p className="text-sm text-gray-300">Direction: Suivez la flèche ↑</p>
                            {nextHintObj.hintNumber === 2 && distanceToNextHint < 100 && (
                                <p className="text-red-400 font-bold animate-pulse text-sm">
                                    ⚠️ Attention! Des grognements étranges se font entendre...
                                </p>
                            )}
                            {isNearHint && (
                                <p className="text-green-400 font-bold animate-pulse">
                                    Vous êtes arrivé à l'indice!
                                </p>
                            )}
                        </div>
                    )}
                </>
            ) : (
                <p>Obtention des coordonnées...</p>
            )}
        </div>
    );
};

export default UserLocation;
