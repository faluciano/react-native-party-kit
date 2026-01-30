import { IGameState } from '@party-kit/core';

// --- State ---

export interface Player {
    id: string;
    name: string;
    score: number;
    team: 'red' | 'blue' | 'green' | 'yellow';
}

export interface BuzzerState extends IGameState {
    players: Record<string, Player>;
    buzzedPlayerId: string | null;
    isLocked: boolean;
}

export const INITIAL_STATE: BuzzerState = {
    players: {},
    buzzedPlayerId: null,
    isLocked: false,
};

// --- Actions ---

export type BuzzerAction =
    | { type: 'JOIN'; payload: { id: string; name: string; team: Player['team'] } }
    | { type: 'LEAVE'; payload: { id: string } }
    | { type: 'BUZZ'; payload: { playerId: string } }
    | { type: 'RESET'; payload: null }
    | { type: 'AWARD_POINTS'; payload: { playerId: string; points: number } }
    | { type: 'LOCK'; payload: null }
    | { type: 'UNLOCK'; payload: null };

// --- Reducer ---

export function buzzerReducer(state: BuzzerState, action: BuzzerAction): BuzzerState {
    switch (action.type) {
        case 'JOIN':
            return {
                ...state,
                players: {
                    ...state.players,
                    [action.payload.id]: {
                        id: action.payload.id,
                        name: action.payload.name,
                        score: 0,
                        team: action.payload.team,
                    },
                },
            };

        case 'LEAVE': {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [action.payload.id]: _, ...remainingPlayers } = state.players;
            return {
                ...state,
                players: remainingPlayers,
            };
        }

        case 'BUZZ':
            // Ignore if locked or someone already buzzed
            if (state.isLocked || state.buzzedPlayerId) {
                return state;
            }
            return {
                ...state,
                buzzedPlayerId: action.payload.playerId,
                isLocked: true, // Auto-lock on buzz
            };

        case 'RESET':
            return {
                ...state,
                buzzedPlayerId: null,
                isLocked: false,
            };

        case 'AWARD_POINTS': {
            const player = state.players[action.payload.playerId];
            if (!player) return state;

            return {
                ...state,
                players: {
                    ...state.players,
                    [action.payload.playerId]: {
                        ...player,
                        score: player.score + action.payload.points,
                    },
                },
            };
        }
        
        case 'LOCK':
            return { ...state, isLocked: true };
            
        case 'UNLOCK':
            return { ...state, isLocked: false };

        default:
            return state;
    }
}
