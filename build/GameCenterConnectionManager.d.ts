import { GameCenterPlayer } from './index';
export type ConnectionState = 'uninitialized' | 'checking' | 'authenticated' | 'not_available' | 'error';
export interface ConnectionStatus {
    state: ConnectionState;
    isAvailable: boolean;
    isAuthenticated: boolean;
    player: GameCenterPlayer | null;
    lastError: string | null;
    lastCheck: number;
}
export type StateChangeListener = (status: ConnectionStatus) => void;
export declare class GameCenterConnectionManager {
    private static instance;
    private connectionStatus;
    private listeners;
    private isCheckingConnection;
    private readonly CACHE_DURATION;
    private constructor();
    static getInstance(): GameCenterConnectionManager;
    getStatus(): ConnectionStatus;
    getModule(): import("./index").GameCenterModule;
    addListener(listener: StateChangeListener): () => void;
    private notifyListeners;
    private updateStatus;
    checkConnection(force?: boolean): Promise<ConnectionStatus>;
    authenticate(): Promise<boolean>;
    submitScore(score: number, leaderboardID: string): Promise<boolean>;
    reportAchievement(achievementID: string, percentComplete: number): Promise<boolean>;
    presentLeaderboard(leaderboardID: string): Promise<void>;
    presentAchievements(): Promise<void>;
    presentGameCenter(): Promise<void>;
    reset(): void;
}
export default GameCenterConnectionManager;
//# sourceMappingURL=GameCenterConnectionManager.d.ts.map