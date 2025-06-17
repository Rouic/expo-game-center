import { NativeModule } from 'expo';

declare class ExpoGameCenterModule extends NativeModule {
  isGameCenterAvailable(): Promise<boolean>;
  authenticateLocalPlayer(): Promise<boolean>;
  getConstants(): { isGameCenterAvailable: boolean };
  getLocalPlayer(): Promise<{ playerID: string; displayName: string; alias: string } | null>;
  getPlayerImage(): Promise<string | null>;
  submitScore(score: number, leaderboardID: string): Promise<boolean>;
  reportAchievement(achievementID: string, percentComplete: number): Promise<boolean>;
  presentLeaderboard(leaderboardID: string): Promise<void>;
  presentAchievements(): Promise<void>;
  presentGameCenterViewController(): Promise<void>;
}

// Use expo-modules-core for better reliability
let GameCenterNativeModule: ExpoGameCenterModule | null = null;

try {
  const { requireNativeModule } = require('expo-modules-core');
  GameCenterNativeModule = requireNativeModule('ExpoGameCenter');
  console.log('[ExpoGameCenter] Native module loaded successfully via expo-modules-core');
} catch (error: any) {
  console.log('[ExpoGameCenter] Failed to load native module:', error?.message || 'Unknown error');
  // Try alternative method
  try {
    const { requireNativeModule } = require('expo');
    GameCenterNativeModule = requireNativeModule('ExpoGameCenter');
    console.log('[ExpoGameCenter] Native module loaded successfully via expo');
  } catch (fallbackError: any) {
    console.log('[ExpoGameCenter] All native module loading attempts failed:', fallbackError?.message || 'Unknown error');
    GameCenterNativeModule = null;
  }
}

export default GameCenterNativeModule;