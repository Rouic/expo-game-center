export interface GameCenterPlayer {
    playerID: string;
    displayName: string;
    alias: string;
}
export interface GameCenterModule {
    isGameCenterAvailable(): Promise<boolean>;
    authenticateLocalPlayer(): Promise<boolean>;
    getLocalPlayer(): Promise<GameCenterPlayer | null>;
    getPlayerImage(): Promise<string | null>;
    submitScore(score: number, leaderboardID: string): Promise<boolean>;
    reportAchievement(achievementID: string, percentComplete: number): Promise<boolean>;
    presentLeaderboard(leaderboardID: string): Promise<void>;
    presentAchievements(): Promise<void>;
    presentGameCenterViewController(): Promise<void>;
}
export { GameCenterConnectionManager, type ConnectionState, type ConnectionStatus, type StateChangeListener } from './GameCenterConnectionManager';
export { GameCenterService, type GameCenterConfig, type ScoreSubmissionResult, type AchievementResult } from './GameCenterService';
export { useGameCenter, type UseGameCenterOptions, type UseGameCenterReturn } from './hooks';
declare const WrappedGameCenterModule: GameCenterModule;
export default WrappedGameCenterModule;
//# sourceMappingURL=index.d.ts.map