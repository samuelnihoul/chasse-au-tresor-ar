'use client';

import React, { useState, useEffect } from 'react';

interface ZombieBattleProps {
    onComplete: () => void;
    hint: string;
}

const ZombieBattle: React.FC<ZombieBattleProps> = ({ onComplete, hint }) => {
    const [zombieHealth, setZombieHealth] = useState(100);
    const [playerHealth, setPlayerHealth] = useState(100);
    const [isAttacking, setIsAttacking] = useState(false);
    const [zombieAttacking, setZombieAttacking] = useState(false);
    const [battleLog, setBattleLog] = useState<string[]>(['Un zombie apparaît! Combattez-le pour obtenir l\'indice!']);
    const [battleWon, setBattleWon] = useState(false);
    const [battleLost, setBattleLost] = useState(false);

    const addToBattleLog = (message: string) => {
        setBattleLog(prev => [...prev.slice(-4), message]);
    };

    const playerAttack = () => {
        if (isAttacking || zombieAttacking || battleWon || battleLost) return;
        
        setIsAttacking(true);
        const damage = Math.floor(Math.random() * 25) + 15; // 15-40 damage
        const newHealth = Math.max(0, zombieHealth - damage);
        setZombieHealth(newHealth);
        
        addToBattleLog(`Vous attaquez le zombie! -${damage} PV`);
        
        if (newHealth <= 0) {
            setBattleWon(true);
            addToBattleLog('🎉 Vous avez vaincu le zombie!');
            setTimeout(() => {
                onComplete();
            }, 2000);
        } else {
            // Zombie counter attack
            setTimeout(() => {
                zombieAttack();
            }, 1000);
        }
        
        setTimeout(() => setIsAttacking(false), 500);
    };

    const zombieAttack = () => {
        if (battleWon || battleLost) return;
        
        setZombieAttacking(true);
        const damage = Math.floor(Math.random() * 15) + 5; // 5-20 damage
        const newHealth = Math.max(0, playerHealth - damage);
        setPlayerHealth(newHealth);
        
        addToBattleLog(`Le zombie vous attaque! -${damage} PV`);
        
        if (newHealth <= 0) {
            setBattleLost(true);
            addToBattleLog('💀 Le zombie vous a vaincu... Réessayez!');
        }
        
        setTimeout(() => setZombieAttacking(false), 500);
    };

    const resetBattle = () => {
        setZombieHealth(100);
        setPlayerHealth(100);
        setBattleWon(false);
        setBattleLost(false);
        setBattleLog(['Un zombie apparaît! Combattez-le pour obtenir l\'indice!']);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-900 border-2 border-red-600 rounded-lg p-6 max-w-lg w-full mx-4">
                <h2 className="text-2xl font-bold text-center text-red-500 mb-4">
                    🧟 COMBAT CONTRE LE ZOMBIE! (indice 2)🧟
                </h2>
                
                {/* Battle Scene */}
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-4">
                        {/* Player */}
                        <div className="text-center">
                            <div className="text-4xl mb-2">🗡️</div>
                            <div className="text-white font-semibold">Vous</div>
                            <div className="w-24 bg-gray-700 rounded-full h-4 mt-2">
                                <div 
                                    className="bg-green-500 h-4 rounded-full transition-all duration-300"
                                    style={{ width: `${playerHealth}%` }}
                                />
                            </div>
                            <div className="text-xs text-gray-400 mt-1">{playerHealth}/100 PV</div>
                        </div>
                        
                        {/* VS */}
                        <div className="text-2xl text-yellow-400 font-bold animate-pulse">VS</div>
                        
                        {/* Zombie */}
                        <div className="text-center">
                            <div className={`text-4xl mb-2 ${zombieAttacking ? 'animate-bounce' : ''}`}>🧟</div>
                            <div className="text-white font-semibold">Zombie</div>
                            <div className="w-24 bg-gray-700 rounded-full h-4 mt-2">
                                <div 
                                    className="bg-red-500 h-4 rounded-full transition-all duration-300"
                                    style={{ width: `${zombieHealth}%` }}
                                />
                            </div>
                            <div className="text-xs text-gray-400 mt-1">{zombieHealth}/100 PV</div>
                        </div>
                    </div>
                    
                    {/* Battle Log */}
                    <div className="bg-black rounded p-2 h-24 overflow-y-auto">
                        {battleLog.map((log, index) => (
                            <div key={index} className="text-xs text-gray-300">
                                {log}
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                    {!battleWon && !battleLost && (
                        <button
                            onClick={playerAttack}
                            disabled={isAttacking || zombieAttacking}
                            className={`flex-1 font-bold py-3 px-4 rounded transition-all ${
                                isAttacking || zombieAttacking
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                            }`}
                        >
                            {isAttacking ? '🗡️ Attaque...' : '⚔️ ATTAQUER'}
                        </button>
                    )}
                    
                    {battleLost && (
                        <button
                            onClick={resetBattle}
                            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded"
                        >
                            🔄 Réessayer
                        </button>
                    )}
                    
                    {battleWon && (
                        <div className="flex-1 bg-green-600 text-white font-bold py-3 px-4 rounded text-center animate-pulse">
                            ✨ Indice débloqué!
                        </div>
                    )}
                </div>
                
                {battleWon && (
                    <div className="mt-4 p-3 bg-yellow-900 rounded border border-yellow-600">
                        <p className="text-yellow-300 text-sm font-semibold">Indice obtenu:</p>
                        <p className="text-yellow-100 text-sm mt-1">{hint}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ZombieBattle;
