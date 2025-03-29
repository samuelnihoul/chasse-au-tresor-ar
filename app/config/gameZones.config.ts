export interface GameZone {
    id: string;
    name: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

export const gameZones: GameZone[] = [
    {
        id: 'parc',
        name: 'Parc de la Ville',
        description: 'Une zone calme et paisible, parfaite pour commencer votre aventure',
        difficulty: 'easy'
    },
    {
        id: 'centre',
        name: 'Centre-ville',
        description: 'Le cœur battant de la ville, où les défis deviennent plus intenses',
        difficulty: 'medium'
    },
    {
        id: 'ruelles',
        name: 'Ruelles Anciennes',
        description: 'Les ruelles mystérieuses de la vieille ville, pour les plus courageux',
        difficulty: 'hard'
    }
]; 