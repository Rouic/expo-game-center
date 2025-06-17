import { Platform } from 'react-native';
import { GameCenterConnectionManager, ConnectionStatus, ConnectionState } from './GameCenterConnectionManager';
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

export class GameCenterService {
  private connectionManager: GameCenterConnectionManager;
  private config: GameCenterConfig;
  private logger: (message: string, data?: any) => void;

  constructor(config: GameCenterConfig = {}) {
    this.connectionManager = GameCenterConnectionManager.getInstance();
    this.config = config;
    this.logger = config.enableLogging 
      ? (message: string, data?: any) => console.log(`[GameCenterService] ${message}`, data || '')
      : () => {};
  }

  /**
   * Initialize GameCenter and check connection status
   */
  public async initialize(): Promise<ConnectionStatus> {
    this.logger('Initializing GameCenter service');
    
    if (Platform.OS !== 'ios') {
      this.logger('Platform is not iOS, GameCenter not available');
      return this.connectionManager.getStatus();
    }

    return await this.connectionManager.checkConnection(true);
  }

  /**
   * Get current connection status
   */
  public getStatus(): ConnectionStatus {
    return this.connectionManager.getStatus();
  }

  /**
   * Check if GameCenter is available and ready to use
   */
  public isReady(): boolean {
    const status = this.getStatus();
    return status.state === 'authenticated' && status.isAuthenticated;
  }

  /**
   * Authenticate with GameCenter
   */
  public async authenticate(): Promise<boolean> {
    this.logger('Attempting authentication');
    
    if (Platform.OS !== 'ios') {
      this.logger('Authentication failed: not iOS platform');
      return false;
    }

    try {
      return await this.connectionManager.authenticate();
    } catch (error) {
      this.logger('Authentication failed', error);
      return false;
    }
  }

  /**
   * Get authenticated player information
   */
  public getPlayer(): GameCenterPlayer | null {
    return this.getStatus().player;
  }

  /**
   * Submit score to a leaderboard
   */
  public async submitScore(
    score: number, 
    leaderboardKey: string
  ): Promise<ScoreSubmissionResult> {
    const leaderboardID = this.config.leaderboards?.[leaderboardKey] || leaderboardKey;
    
    this.logger('Submitting score', { score, leaderboardID });

    if (!this.isReady()) {
      const error = 'GameCenter not ready for score submission';
      this.logger(error);
      return { success: false, error };
    }

    try {
      const success = await this.connectionManager.submitScore(score, leaderboardID);
      this.logger('Score submission result', { success });
      
      return success 
        ? { success: true }
        : { success: false, error: 'Score submission failed' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger('Score submission error', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Report achievement progress
   */
  public async reportAchievement(
    achievementKey: string,
    percentComplete: number = 100
  ): Promise<AchievementResult> {
    const achievementID = this.config.achievements?.[achievementKey] || achievementKey;
    
    this.logger('Reporting achievement', { achievementID, percentComplete });

    if (!this.isReady()) {
      const error = 'GameCenter not ready for achievement reporting';
      this.logger(error);
      return { success: false, error };
    }

    try {
      const success = await this.connectionManager.reportAchievement(achievementID, percentComplete);
      this.logger('Achievement reporting result', { success });
      
      return success 
        ? { success: true }
        : { success: false, error: 'Achievement reporting failed' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger('Achievement reporting error', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Present leaderboard UI
   */
  public async showLeaderboard(leaderboardKey: string): Promise<void> {
    const leaderboardID = this.config.leaderboards?.[leaderboardKey] || leaderboardKey;
    
    this.logger('Showing leaderboard', { leaderboardID });

    if (!this.isReady()) {
      this.logger('Cannot show leaderboard: GameCenter not ready');
      return;
    }

    await this.connectionManager.presentLeaderboard(leaderboardID);
  }

  /**
   * Present achievements UI
   */
  public async showAchievements(): Promise<void> {
    this.logger('Showing achievements');

    if (!this.isReady()) {
      this.logger('Cannot show achievements: GameCenter not ready');
      return;
    }

    await this.connectionManager.presentAchievements();
  }

  /**
   * Present GameCenter dashboard
   */
  public async showGameCenter(): Promise<void> {
    this.logger('Showing GameCenter dashboard');

    if (!this.isReady()) {
      this.logger('Cannot show GameCenter: not ready');
      return;
    }

    await this.connectionManager.presentGameCenter();
  }

  /**
   * Add a connection status listener
   */
  public addStatusListener(callback: (status: ConnectionStatus) => void): () => void {
    return this.connectionManager.addListener(callback);
  }

  /**
   * Check if platform supports GameCenter
   */
  public static isPlatformSupported(): boolean {
    return Platform.OS === 'ios';
  }

  /**
   * Get connection state description
   */
  public getConnectionStateDescription(state?: ConnectionState): string {
    const currentState = state || this.getStatus().state;
    
    switch (currentState) {
      case 'uninitialized':
        return 'GameCenter not initialized';
      case 'checking':
        return 'Checking GameCenter availability';
      case 'authenticated':
        return 'Connected to GameCenter';
      case 'not_available':
        return 'GameCenter not available or user not signed in';
      case 'error':
        return 'GameCenter connection error';
      default:
        return 'Unknown state';
    }
  }

  /**
   * Reset connection and force re-initialization
   */
  public reset(): void {
    this.logger('Resetting GameCenter service');
    this.connectionManager.reset();
  }
}

export default GameCenterService;