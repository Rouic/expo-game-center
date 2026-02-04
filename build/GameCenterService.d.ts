import { ConnectionStatus, ConnectionState } from './GameCenterConnectionManager';
import { GameCenterPlayer } from './index';
export interface GameCenterConfig {
    leaderboards?: Record<string, string>;
    achievements?: Record<string, string>;
    enableLogging?: boolean;
}
export interface ScoreSubmissionResult {
    success: boolean;
    error?: string;
}
export interface AchievementResult {
    success: boolean;
    error?: string;
}
export declare class GameCenterService {
    private connectionManager;
    private config;
    private logger;
    constructor(config?: GameCenterConfig);
    /**
     * Initialize GameCenter and check connection status
     */
    initialize(): Promise<ConnectionStatus>;
    /**
     * Get current connection status
     */
    getStatus(): ConnectionStatus;
    /**
     * Check if GameCenter is available and ready to use
     */
    isReady(): boolean;
    /**
     * Authenticate with GameCenter
     */
    authenticate(): Promise<boolean>;
    /**
     * Get authenticated player information
     */
    getPlayer(): GameCenterPlayer | null;
    /**
     * Submit score to a leaderboard
     */
    submitScore(score: number, leaderboardKey: string): Promise<ScoreSubmissionResult>;
    /**
     * Report achievement progress
     */
    reportAchievement(achievementKey: string, percentComplete?: number): Promise<AchievementResult>;
    /**
     * Present leaderboard UI
     */
    showLeaderboard(leaderboardKey: string): Promise<void>;
    /**
     * Present achievements UI
     */
    showAchievements(): Promise<void>;
    /**
     * Present GameCenter dashboard
     */
    showGameCenter(): Promise<void>;
    /**
     * Add a connection status listener
     */
    addStatusListener(callback: (status: ConnectionStatus) => void): () => void;
    /**
     * Check if platform supports GameCenter
     */
    static isPlatformSupported(): boolean;
    /**
     * Get connection state description
     */
    getConnectionStateDescription(state?: ConnectionState): string;
    /**
     * Reset connection and force re-initialization
     */
    reset(): void;
}
export default GameCenterService;
//# sourceMappingURL=GameCenterService.d.ts.map