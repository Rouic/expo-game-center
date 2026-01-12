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

// Wrap the native module to add build version marker
const WrappedGameCenterModule: GameCenterModule = {
  isGameCenterAvailable: () => ExpoGameCenterModule!.isGameCenterAvailable(),

  authenticateLocalPlayer: async () => {
    console.log('[ExpoGameCenter] Calling native authenticateLocalPlayer...');

    try {
      const result = await ExpoGameCenterModule!.authenticateLocalPlayer();
      console.log('[ExpoGameCenter] ✅ Authentication result:', result);
      return result;
    } catch (error: any) {
      console.log('[ExpoGameCenter] ❌ Authentication error:', error?.message || error);
      throw error;
    }
  },

  getLocalPlayer: () => ExpoGameCenterModule!.getLocalPlayer(),
  getPlayerImage: () => ExpoGameCenterModule!.getPlayerImage(),
  submitScore: (score: number, leaderboardID: string) => ExpoGameCenterModule!.submitScore(score, leaderboardID),
  reportAchievement: (achievementID: string, percentComplete: number) => ExpoGameCenterModule!.reportAchievement(achievementID, percentComplete),
  presentLeaderboard: (leaderboardID: string) => ExpoGameCenterModule!.presentLeaderboard(leaderboardID),
  presentAchievements: () => ExpoGameCenterModule!.presentAchievements(),
  presentGameCenterViewController: () => ExpoGameCenterModule!.presentGameCenterViewController(),
};

// Default export - wrapped module with build markers
export default WrappedGameCenterModule;