import ExpoGameCenterModule from './ExpoGameCenterModule';

// Core interfaces
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

// Export connection manager (no React dependencies)
export { 
  GameCenterConnectionManager,
  type ConnectionState,
  type ConnectionStatus,
  type StateChangeListener 
} from './GameCenterConnectionManager';

// Export service layer and hooks (users must have React/React Native as peer deps)
export { 
  GameCenterService,
  type GameCenterConfig,
  type ScoreSubmissionResult,
  type AchievementResult 
} from './GameCenterService';

export { 
  useGameCenter,
  type UseGameCenterOptions,
  type UseGameCenterReturn 
} from './hooks';

// Default export - the raw native module
export default ExpoGameCenterModule as GameCenterModule;