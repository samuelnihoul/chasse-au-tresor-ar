'use client';

import { create } from 'zustand';

interface Zombie {
  id: string;
  x: number;
  y: number;
  health: number;
  speed: number;
  active: boolean;
}

interface ZombieState {
  zombies: Zombie[];
  score: number;
  addZombie: (x: number, y: number) => void;
  removeZombie: (id: string) => void;
  updateZombiePosition: (id: string, x: number, y: number) => void;
  damageZombie: (id: string, damage: number) => void;
  increaseScore: (points: number) => void;
  resetZombies: () => void;
  updateZombiePositions: () => void;
}

export const useZombies = create<ZombieState>((set) => ({
  zombies: [],
  score: 0,

  addZombie: (x: number, y: number) => {
    const newZombie: Zombie = {
      id: `zombie-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x,
      y,
      health: 100,
      speed: 0.5 + Math.random() * 1.5, // Vitesse aléatoire entre 0.5 et 2
      active: true
    };

    set((state) => ({
      zombies: [...state.zombies, newZombie]
    }));
  },

  removeZombie: (id: string) => {
    set((state) => ({
      zombies: state.zombies.filter(zombie => zombie.id !== id)
    }));
  },

  updateZombiePosition: (id: string, x: number, y: number) => {
    set((state) => ({
      zombies: state.zombies.map(zombie =>
        zombie.id === id ? { ...zombie, x, y } : zombie
      )
    }));
  },

  damageZombie: (id: string, damage: number) => {
    set((state) => {
      const updatedZombies = state.zombies.map(zombie => {
        if (zombie.id === id) {
          const newHealth = zombie.health - damage;
          return {
            ...zombie,
            health: newHealth,
            active: newHealth > 0
          };
        }
        return zombie;
      });

      // Si le zombie est mort, augmenter le score
      const zombie = state.zombies.find(z => z.id === id);
      if (zombie && zombie.health > 0 && (zombie.health - damage) <= 0) {
        // Le zombie vient d'être tué
        return {
          zombies: updatedZombies,
          score: state.score + 10 // 10 points par zombie tué
        };
      }

      return { zombies: updatedZombies };
    });
  },

  increaseScore: (points: number) => {
    set((state) => ({
      score: state.score + points
    }));
  },

  resetZombies: () => {
    set({
      zombies: [],
      score: 0
    });
  },

  updateZombiePositions: () => {
    set((state) => ({
      zombies: state.zombies.map(zombie => {
        if (!zombie.active) return zombie;

        // Générer des déplacements aléatoires pour le mouvement brownien
        const dx = (Math.random() - 0.5) * 0.02 * zombie.speed; // Déplacement horizontal
        const dy = (Math.random() - 0.5) * 0.02 * zombie.speed; // Déplacement vertical

        // Calculer la nouvelle position
        let newX = zombie.x + dx;
        let newY = zombie.y + dy;

        // Limiter les zombies dans les limites de l'écran (-1 à 1)
        newX = Math.max(-1, Math.min(1, newX));
        newY = Math.max(-1, Math.min(1, newY));

        return { ...zombie, x: newX, y: newY };
      })
    }));
  }
}));
