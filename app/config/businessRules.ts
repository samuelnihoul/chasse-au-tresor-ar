export const STEP_3_LOCKED_MESSAGE = "⚔️ Eliminez le zombie du 2e indice avant de passer a l'indice 3 !";
export const STEP_3_UNLOCKED_MESSAGE = "✅ Zombie elimine ! Vous pouvez passer a l'indice 3.";

export interface BusinessRule {
    id: string;
    description: string;
}

export const GAME_BUSINESS_RULES: BusinessRule[] = [
    {
        id: 'RULE_STEP_3_REQUIRES_HINT_2_ZOMBIE_KILL',
        description: "Le joueur ne peut pas atteindre l'indice 3 tant que le zombie du 2e indice n'est pas elimine."
    }
];

interface HintAccessParams {
    targetHintNumber: number;
    battleCompleted: boolean;
}

export const canAccessHint = ({ targetHintNumber, battleCompleted }: HintAccessParams): boolean => {
    if (targetHintNumber === 3) {
        return battleCompleted;
    }

    return true;
};
