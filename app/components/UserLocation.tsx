'use client';

import React, { useEffect, useState } from 'react';
import { useHints, calculateDistance, useUserPosition } from '../hooks/useHints';

interface Location {
    latitude: number | null;
    longitude: number | null;
    timestamp?: number;
}

const UserLocation: React.FC = () => {
    const [location, setLocation] = useState<Location>({ latitude: null, longitude: null });
    const [startPosition, setStartPosition] = useState<Location | null>(null);
    const [distanceFromStart, setDistanceFromStart] = useState<number>(0);
    const [isNearHint, setIsNearHint] = useState<boolean>(false);
    const [caloriesBurned, setCaloriesBurned] = useState<number>(0);
    const [showHintModal, setShowHintModal] = useState<boolean>(false);
    const [lastHintNumber, setLastHintNumber] = useState<number>(-1);
    const [arrowRotation, setArrowRotation] = useState<number>(0);
    const [speed, setSpeed] = useState<number>(0);
    const [lastLocation, setLastLocation] = useState<Location | null>(null);

    // Constante pour le calcul des calories (60 calories par km de marche)
    const CALORIES_PER_KM = 60;

    // Utiliser le hook useHints pour gérer les indices
    const {
        hints,
        setHints,
        getCurrentHint,
        getNextHint,
        nextHint,
        distanceToNextHint,
        setDistanceToNextHint
    } = useHints();

    // Utiliser le hook useUserPosition pour mettre à jour la distance
    useUserPosition();

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

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                const currentTime = Date.now();

                // Calcul de la vitesse si on a une position précédente
                if (lastLocation && lastLocation.latitude && lastLocation.longitude) {
                    const distance = calculateDistance(
                        lastLocation.latitude,
                        lastLocation.longitude,
                        latitude,
                        longitude
                    );
                    const timeDiff = (currentTime - (lastLocation.timestamp || currentTime)) / 1000; // en secondes
                    if (timeDiff > 0) {
                        const speedKmh = (distance / timeDiff) * 3.6; // conversion m/s en km/h
                        setSpeed(speedKmh);
                    }
                }

                // Mettre à jour la position actuelle avec le timestamp
                const newLocation = { latitude, longitude, timestamp: currentTime };
                setLocation(newLocation);
                setLastLocation(newLocation);

                // Si c'est la première position, la sauvegarder comme point de départ
                if (!startPosition) {
                    setStartPosition(newLocation);
                }

                // Calculer la distance depuis le point de départ
                if (startPosition && startPosition.latitude && startPosition.longitude) {
                    const distance = calculateDistance(
                        startPosition.latitude,
                        startPosition.longitude,
                        latitude,
                        longitude
                    );
                    setDistanceFromStart(distance);
                    // Calculer les calories brûlées
                    setCaloriesBurned(Math.round((distance / 1000) * CALORIES_PER_KM));
                }

                // Calculer la distance jusqu'au prochain indice
                const nextHintConst = getNextHint();
                if (nextHintConst && latitude && longitude) {
                    const distance = calculateDistance(
                        latitude,
                        longitude,
                        nextHintConst.latitude,
                        nextHintConst.longitude
                    );
                    setDistanceToNextHint(distance);

                    // Calculer l'angle pour la flèche
                    const bearing = calculateBearing(
                        latitude,
                        longitude,
                        nextHintConst.latitude,
                        nextHintConst.longitude
                    );
                    setArrowRotation(bearing);

                    // Vérifier si l'utilisateur est proche de l'indice suivant
                    if (distance < PROXIMITY_THRESHOLD) {
                        setIsNearHint(true);
                        // Si c'est la première fois qu'on détecte la proximité, passer à l'indice suivant
                        if (!isNearHint) {
                            const currentHint = getCurrentHint();
                            if (currentHint && currentHint.hintNumber !== lastHintNumber) {
                                setShowHintModal(true);
                                setLastHintNumber(currentHint.hintNumber);
                            }
                            nextHint();
                        }
                    } else {
                        setIsNearHint(false);
                    }
                }
            }, (error) => {
                console.error('Error getting location:', error);
            }, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        } else {
            alert("La géolocalisation n'est pas supportée par ce navigateur.");
        }
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
                    hint.hint !== "pas encore défini" &&
                    hint.gameMap !== "pas encore défini"
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

    // Effet pour la géolocalisation
    useEffect(() => {
        // Première récupération
        getLocation();

        // Mise à jour toutes les 2 secondes
        const interval = setInterval(getLocation, 2000);

        // Nettoyage à la destruction du composant
        return () => clearInterval(interval);
    }, [startPosition]); // Ajouter startPosition comme dépendance

    // Obtenir l'indice actuel
    const currentHint = getCurrentHint();
    const nextHintObj = getNextHint();

    return (
        <div className="bg-opacity-0 rounded-lg p-4 text-white">
            {/* Modal pour le nouvel indice */}
            {showHintModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-purple-900 p-6 rounded-lg max-w-md w-full mx-4">
                        {currentHint && (
                            <>
                                {currentHint.hintNumber === 0 && (
                                    <h3 className="text-xl font-bold mb-4 text-center text-yellow-400">
                                        Bienvenue dans la chasse au trésor!
                                    </h3>
                                )}
                                {currentHint.hint === "FIN" ? (
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
                                        <p className="mb-2">Indice #{currentHint.hintNumber}:</p>
                                        <p className="mb-4">{currentHint.hint}</p>
                                        <p className="text-sm mb-4">Carte: {currentHint.gameMap}</p>
                                    </>
                                )}
                                <button
                                    onClick={() => setShowHintModal(false)}
                                    className="bg-purple-700 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded w-full"
                                >
                                    Fermer
                                </button>
                            </>
                        )}
                    </div>
                </div>
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
