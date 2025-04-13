'use client';

import React, { useEffect, useState } from 'react';
import { useHints, calculateDistance, useUserPosition } from '../hooks/useHints';

interface Location {
    latitude: number | null;
    longitude: number | null;
}

const UserLocation: React.FC = () => {
    const [location, setLocation] = useState<Location>({ latitude: null, longitude: null });
    const [startPosition, setStartPosition] = useState<Location | null>(null);
    const [distanceFromStart, setDistanceFromStart] = useState<number>(0);
    const [isNearHint, setIsNearHint] = useState<boolean>(false);
    const [caloriesBurned, setCaloriesBurned] = useState<number>(0);
    const [showHintModal, setShowHintModal] = useState<boolean>(false);
    const [lastHintNumber, setLastHintNumber] = useState<number>(-1);

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

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;

                // Mettre à jour la position actuelle
                setLocation({ latitude, longitude });

                // Si c'est la première position, la sauvegarder comme point de départ
                if (!startPosition) {
                    setStartPosition({ latitude, longitude });
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
                timeout: 5000,
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
                setHints(validHints);
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
                                {currentHint.hintNumber === 1 && (
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

            <h2 className="text-lg font-semibold mb-2">Coordonnées de l'utilisateur</h2>
            {location.latitude !== null && location.longitude !== null ? (
                <>
                    <p>Latitude : {location.latitude.toFixed(6)}°</p>
                    <p>Longitude : {location.longitude.toFixed(6)}°</p>

                    {startPosition && (
                        <div className="mt-2">
                            <p className="font-semibold">Distance depuis le départ :</p>
                            <p>{(distanceFromStart < 1000)
                                ? `${distanceFromStart.toFixed(0)} m`
                                : `${(distanceFromStart / 1000).toFixed(2)} km`}
                            </p>
                            <p className="text-green-400">
                                Calories brûlées : {caloriesBurned} kcal
                            </p>
                        </div>
                    )}

                    {currentHint && (
                        <div className="mt-2 p-2 bg-purple-900 bg-opacity-50 rounded">
                            <p className="font-bold">Indice actuel ({currentHint.hintNumber}):</p>
                            <p>{currentHint.hint}</p>
                            <p className="text-sm">Carte: {currentHint.gameMap}</p>
                        </div>
                    )}

                    {nextHintObj && distanceToNextHint !== null && (
                        <div className="mt-2">
                            <p className="font-semibold">Prochain indice: #{nextHintObj.hintNumber}</p>
                            <p>Distance: {(distanceToNextHint < 1000)
                                ? `${distanceToNextHint.toFixed(0)} m`
                                : `${(distanceToNextHint / 1000).toFixed(2)} km`}
                            </p>
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
