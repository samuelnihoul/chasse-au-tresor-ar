'use client';

import { create } from 'zustand';

interface Zombie {
  id: string;
  x: number;
  y: number;
  // Coordonnées GPS pour fixer le zombie dans l'environnement
  latitude: number;
  longitude: number;
  health: number;
  speed: number;
  active: boolean;
  // Indique si le zombie est fixe dans l'environnement
  fixed: boolean;
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

const MAX_ZOMBIES = 10;

export const useZombies = create<ZombieState>((set) => ({
  zombies: [],
  score: 0,

  addZombie: (x: number, y: number) => {
    // Obtenir les coordonnées GPS actuelles (simulation pour cet exemple)
    const currentLatitude = Math.random() * 0.001 + 48.8566; // Simule une position autour de Paris
    const currentLongitude = Math.random() * 0.001 + 2.3522;

    const newZombie: Zombie = {
      id: `zombie-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x,
      y,
      latitude: currentLatitude,
      longitude: currentLongitude,
      health: 100,
      speed: 0.5 + Math.random() * 1.5, // Vitesse aléatoire entre 0.5 et 2
      active: true,
      fixed: true // Par défaut, les nouveaux zombies sont fixés dans l'environnement
    };

    set((state) => {
      let updatedZombies = [...state.zombies, newZombie];

      // Si on dépasse la limite, supprimer les zombies les plus anciens
      if (updatedZombies.length > MAX_ZOMBIES) {
        // Trier les zombies par ID (qui contient le timestamp) pour trouver les plus anciens
        updatedZombies.sort((a, b) => {
          const timeA = parseInt(a.id.split('-')[1]);
          const timeB = parseInt(b.id.split('-')[1]);
          return timeA - timeB;
        });

        // Garder seulement les MAX_ZOMBIES zombies les plus récents
        updatedZombies = updatedZombies.slice(-MAX_ZOMBIES);
      }

      return {
        zombies: updatedZombies
      };
    });
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

        // Ne pas mettre à jour la position des zombies fixes dans l'environnement
        if (zombie.fixed) return zombie;

        // Pour les zombies non fixes, continuer avec le mouvement brownien
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
