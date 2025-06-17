import ExpoGameCenterModule from './ExpoGameCenterModule';

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

export default ExpoGameCenterModule as GameCenterModule;