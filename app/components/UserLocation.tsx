'use client';

import React, { useEffect, useState } from 'react';
import { useHints, calculateDistance } from '../hooks/useHints';

interface Location {
    latitude: number | null;
    longitude: number | null;
}

interface Position {
    latitude: number;
    longitude: number;
    timestamp: number;
}

const UserLocation: React.FC = () => {
    const [location, setLocation] = useState<Location>({ latitude: null, longitude: null });
    const [totalDistance, setTotalDistance] = useState<number>(0);
    const [previousPositions, setPreviousPositions] = useState<Position[]>([]);
    const [isNearHint, setIsNearHint] = useState<boolean>(false);
    
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

    // Seuil de proximité pour considérer qu'un utilisateur a atteint un indice (en mètres)
    const PROXIMITY_THRESHOLD = 20;

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                const currentTime = Date.now();

                // Mettre à jour la position actuelle
                setLocation({ latitude, longitude });
                
                // Calculer la distance jusqu'au prochain indice
                const nextHint = getNextHint();
                if (nextHint && latitude && longitude) {
                    const distance = calculateDistance(
                        latitude,
                        longitude,
                        nextHint.latitude,
                        nextHint.longitude
                    );
                    setDistanceToNextHint(distance);
                    
                    // Vérifier si l'utilisateur est proche de l'indice suivant
                    if (distance < PROXIMITY_THRESHOLD) {
                        setIsNearHint(true);
                        // Si c'est la première fois qu'on détecte la proximité, passer à l'indice suivant
                        if (!isNearHint) {
                            nextHint();
                        }
                    } else {
                        setIsNearHint(false);
                    }
                }

                // Calculer la distance depuis la dernière position
                if (previousPositions.length > 0) {
                    const lastPosition = previousPositions[previousPositions.length - 1];
                    const distance = calculateDistance(
                        lastPosition.latitude,
                        lastPosition.longitude,
                        latitude,
                        longitude
                    );
                    setTotalDistance(prev => prev + distance / 1000); // Convertir en km pour l'affichage
                }

                // Mettre à jour l'historique des positions
                setPreviousPositions(prev => {
                    const newPositions = [...prev, { latitude, longitude, timestamp: currentTime }];
                    // Garder seulement les 100 dernières positions pour éviter une utilisation excessive de la mémoire
                    return newPositions.slice(-100);
                });
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

    useEffect(() => {
        // Première récupération
        getLocation();

        // Mise à jour toutes les 2 secondes
        const interval = setInterval(getLocation, 2000);

        // Nettoyage à la destruction du composant
        return () => clearInterval(interval);
    }, []);

    // Obtenir l'indice actuel
    const currentHint = getCurrentHint();
    const nextHintObj = getNextHint();

    return (
        <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-4 text-white">
            <h2 className="text-lg font-semibold mb-2">Coordonnées de l'utilisateur</h2>
            {location.latitude !== null && location.longitude !== null ? (
                <>
                    <p>Latitude : {location.latitude.toFixed(6)}°</p>
                    <p>Longitude : {location.longitude.toFixed(6)}°</p>
                    
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
                    
                    <p className="mt-2">Distance totale parcourue : {totalDistance.toFixed(2)} km</p>
                </>
            ) : (
                <p>Obtention des coordonnées...</p>
            )}
        </div>
    );
};

export default UserLocation;
