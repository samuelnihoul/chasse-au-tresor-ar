// app/components/CameraFeed.tsx
'use client';

import React, { useEffect, useRef } from 'react';

const CameraFeed: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const startVideo = async () => {
            if (videoRef.current) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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

    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: '100%', height: 'auto', marginTop: '20px' }}
        />
    );
};

export default CameraFeed;