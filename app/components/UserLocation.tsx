'use client';
// app/components/UserLocation.ts
import React, { useEffect, useState } from 'react';

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
    const [distanceToNorthPole, setDistanceToNorthPole] = useState<number | null>(null);
    const [totalDistance, setTotalDistance] = useState<number>(0);
    const [previousPositions, setPreviousPositions] = useState<Position[]>([]);

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Rayon de la Terre en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                const currentTime = Date.now();

                // Mettre à jour la position actuelle
                setLocation({ latitude, longitude });
                calculateDistanceToNorthPole(latitude);

                // Calculer la distance depuis la dernière position
                if (previousPositions.length > 0) {
                    const lastPosition = previousPositions[previousPositions.length - 1];
                    const distance = calculateDistance(
                        lastPosition.latitude,
                        lastPosition.longitude,
                        latitude,
                        longitude
                    );
                    setTotalDistance(prev => prev + distance);
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

    useEffect(() => {
        // Première récupération
        getLocation();

        // Mise à jour toutes les 2 secondes
        const interval = setInterval(getLocation, 2000);

        // Nettoyage à la destruction du composant
        return () => clearInterval(interval);
    }, []);

    const calculateDistanceToNorthPole = (latitude: number) => {
        const northPoleLatitude = 90;
        const latitudeInRadians = (latitude * Math.PI) / 180;
        const northPoleLatitudeInRadians = (northPoleLatitude * Math.PI) / 180;
        const distance = 6371 * Math.acos(
            Math.sin(latitudeInRadians) * Math.sin(northPoleLatitudeInRadians) +
            Math.cos(latitudeInRadians) * Math.cos(northPoleLatitudeInRadians)
        );
        setDistanceToNorthPole(distance);
    };

    return (
        <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-4 text-white">
            <h2 className="text-lg font-semibold mb-2">Coordonnées de l'utilisateur</h2>
            {location.latitude !== null && location.longitude !== null ? (
                <>
                    <p>Latitude : {location.latitude.toFixed(6)}°</p>
                    <p>Longitude : {location.longitude.toFixed(6)}°</p>
                    <p className="mt-2">Distance au prochain indice : {distanceToNorthPole?.toFixed(2)} km</p>
                    <p className="mt-2">Distance totale parcourue : {totalDistance.toFixed(2)} km</p>
                </>
            ) : (
                <p>Obtention des coordonnées...</p>
            )}
        </div>
    );
};

export default UserLocation;