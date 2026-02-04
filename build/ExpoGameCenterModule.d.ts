interface ExpoGameCenterModule {
    isGameCenterAvailable(): Promise<boolean>;
    authenticateLocalPlayer(): Promise<boolean>;
    getConstants(): {
        isGameCenterAvailable: boolean;
    };
    getLocalPlayer(): Promise<{
        playerID: string;
        displayName: string;
        alias: string;
    } | null>;
    getPlayerImage(): Promise<string | null>;
    submitScore(score: number, leaderboardID: string): Promise<boolean>;
    reportAchievement(achievementID: string, percentComplete: number): Promise<boolean>;
    presentLeaderboard(leaderboardID: string): Promise<void>;
    presentAchievements(): Promise<void>;
    presentGameCenterViewController(): Promise<void>;
}
declare let GameCenterNativeModule: ExpoGameCenterModule | null;
export default GameCenterNativeModule;
//# sourceMappingURL=ExpoGameCenterModule.d.ts.map