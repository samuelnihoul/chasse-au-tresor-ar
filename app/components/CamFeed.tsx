'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useHints } from '../hooks/useHints';

const CameraFeed: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const scrollImageRef = useRef<HTMLImageElement | null>(null);
    const [showScroll, setShowScroll] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // Get current hint using the useHints hook
    const { getCurrentHint } = useHints();
    const currentHint = getCurrentHint();





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

        // Effacer le canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

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


    // Effect to handle showing/hiding the scroll with hint
    useEffect(() => {
        if (currentHint) {
            setShowScroll(true);
        } else {
            setShowScroll(false);
        }
    }, [currentHint]);



    // Render the hint on the scroll
    const renderHintScroll = () => {
        if (!showScroll || !currentHint || !scrollImageRef.current) return null;

        return (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center z-30">
                <div className="relative">
                    <img
                        src="/scroll1.png"
                        alt="Scroll"
                        className="w-80 h-auto"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center px-16 pt-12 pb-20 text-center">
                        <h3 className="text-xl font-bold mb-2 text-gray-800">Indice #{currentHint.hintNumber}</h3>
                        <p className="text-gray-800 font-semibold">{currentHint.hint}</p>
                        {currentHint.gameMap && (
                            <p className="text-xs mt-2 text-gray-700">Zone: {currentHint.gameMap}</p>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => setShowScroll(false)}
                    className="mt-4 bg-purple-700 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-full shadow-lg"
                >
                    Fermer
                </button>
            </div>
        );
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
            <div className="absolute top-0 left-0 w-full h-full">
                {/* Pause Button */}
                <button
                    onClick={() => setIsPaused((prev) => !prev)}
                    className={`absolute top-4 left-4 px-4 py-2 rounded-lg font-bold shadow-lg transition-all duration-300 ${isPaused ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}
                >
                    {isPaused ? 'Reprendre' : 'Pause'}
                </button>
            </div>
            {renderHintScroll()}
        </div>
    );
};

export default CameraFeed;
