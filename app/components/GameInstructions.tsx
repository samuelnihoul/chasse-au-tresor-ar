'use client';

import React, { useState, useEffect } from 'react';
import { useHints } from '../hooks/useHints';

const GameInstructions: React.FC = () => {
  const [showInstructions, setShowInstructions] = useState(true);
  const { getCurrentHint } = useHints();
  const currentHint = getCurrentHint();

  // Fermer automatiquement les instructions après 10 secondes
  useEffect(() => {
    if (showInstructions) {
      const timer = setTimeout(() => {
        setShowInstructions(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [showInstructions]);

  if (!showInstructions) {
    return (
      <button 
        onClick={() => setShowInstructions(true)}
        className="absolute top-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full shadow-lg z-50"
      >
        ?
      </button>
    );
  }

  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 text-white p-6 rounded-xl max-w-md w-full shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 text-purple-400">Chasse au Trésor AR</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-yellow-300">Comment jouer :</h3>
            <p>Suivez les indices pour trouver le trésor caché. Chaque indice vous guidera vers le prochain emplacement.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-yellow-300">Attention aux zombies !</h3>
            <p>Des zombies apparaîtront sur votre chemin. Touchez-les à l'écran pour les éliminer avant qu'ils ne vous atteignent.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-yellow-300">Indice actuel :</h3>
            <p className="italic bg-purple-900 p-2 rounded">
              {currentHint ? currentHint.hint : "Aucun indice disponible pour le moment."}
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => setShowInstructions(false)}
          className="mt-6 bg-purple-600 text-white px-4 py-2 rounded-lg w-full hover:bg-purple-700 transition-colors"
        >
          Commencer l'aventure
        </button>
      </div>
    </div>
  );
};

export default GameInstructions;
