import ExpoGameCenterModule, { GameCenterPlayer } from './index';

export type ConnectionState = 
  | 'uninitialized'
  | 'checking'
  | 'authenticated'
  | 'not_available'
  | 'error';

export interface ConnectionStatus {
  state: ConnectionState;
  isAvailable: boolean;
  isAuthenticated: boolean;
  player: GameCenterPlayer | null;
  lastError: string | null;
  lastCheck: number;
}

export type StateChangeListener = (status: ConnectionStatus) => void;

export class GameCenterConnectionManager {
  private static instance: GameCenterConnectionManager;
  private connectionStatus: ConnectionStatus = {
    state: 'uninitialized',
    isAvailable: false,
    isAuthenticated: false,
    player: null,
    lastError: null,
    lastCheck: 0,
  };
  
  private listeners = new Set<StateChangeListener>();
  private isCheckingConnection = false;
  private readonly CACHE_DURATION = 5000; // 5 seconds

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): GameCenterConnectionManager {
    if (!GameCenterConnectionManager.instance) {
      GameCenterConnectionManager.instance = new GameCenterConnectionManager();
    }
    return GameCenterConnectionManager.instance;
  }

  public getStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  public getModule() {
    return ExpoGameCenterModule;
  }

  public addListener(listener: StateChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getStatus());
      } catch (error) {
        console.error('[GameCenter] Listener error:', error);
      }
    });
  }

  private updateStatus(updates: Partial<ConnectionStatus>): void {
    this.connectionStatus = {
      ...this.connectionStatus,
      ...updates,
      lastCheck: Date.now(),
    };
    this.notifyListeners();
  }

  public async checkConnection(force = false): Promise<ConnectionStatus> {
    const now = Date.now();
    const isCacheValid = now - this.connectionStatus.lastCheck < this.CACHE_DURATION;

    if (!force && isCacheValid && this.connectionStatus.state !== 'uninitialized') {
      return this.getStatus();
    }

    if (this.isCheckingConnection) {
      return this.getStatus();
    }

    this.isCheckingConnection = true;
    this.updateStatus({ state: 'checking', lastError: null });

    try {
      // Check if GameCenter is available
      const isAvailable = await ExpoGameCenterModule.isGameCenterAvailable();
      
      if (!isAvailable) {
        this.updateStatus({
          state: 'not_available',
          isAvailable: false,
          isAuthenticated: false,
          player: null,
        });
        return this.getStatus();
      }

      // Check authentication status
      const isAuthenticated = await ExpoGameCenterModule.authenticateLocalPlayer();
      
      if (isAuthenticated) {
        const player = await ExpoGameCenterModule.getLocalPlayer();
        this.updateStatus({
          state: 'authenticated',
          isAvailable: true,
          isAuthenticated: true,
          player,
        });
      } else {
        this.updateStatus({
          state: 'not_available', // User not signed in
          isAvailable: true,
          isAuthenticated: false,
          player: null,
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[GameCenter] Connection check failed:', errorMessage);
      
      this.updateStatus({
        state: 'error',
        isAvailable: false,
        isAuthenticated: false,
        player: null,
        lastError: errorMessage,
      });
    } finally {
      this.isCheckingConnection = false;
    }

    return this.getStatus();
  }

  public async authenticate(): Promise<boolean> {
    const status = await this.checkConnection(true);
    return status.isAuthenticated;
  }

  public async submitScore(score: number, leaderboardID: string): Promise<boolean> {
    const status = this.getStatus();
    
    if (!status.isAuthenticated || !ExpoGameCenterModule) {
      console.warn('[GameCenter] Cannot submit score: not authenticated');
      return false;
    }

    try {
      return await ExpoGameCenterModule.submitScore(score, leaderboardID);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Score submission failed';
      console.error('[GameCenter] Score submission failed:', errorMessage);
      this.updateStatus({ lastError: errorMessage });
      return false;
    }
  }

  public async reportAchievement(achievementID: string, percentComplete: number): Promise<boolean> {
    const status = this.getStatus();
    
    if (!status.isAuthenticated || !ExpoGameCenterModule) {
      console.warn('[GameCenter] Cannot report achievement: not authenticated');
      return false;
    }

    try {
      return await ExpoGameCenterModule.reportAchievement(achievementID, percentComplete);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Achievement reporting failed';
      console.error('[GameCenter] Achievement reporting failed:', errorMessage);
      this.updateStatus({ lastError: errorMessage });
      return false;
    }
  }

  public async presentLeaderboard(leaderboardID: string): Promise<void> {
    const status = this.getStatus();
    
    if (!status.isAuthenticated || !ExpoGameCenterModule) {
      console.warn('[GameCenter] Cannot present leaderboard: not authenticated');
      return;
    }

    try {
      await ExpoGameCenterModule.presentLeaderboard(leaderboardID);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Leaderboard presentation failed';
      console.error('[GameCenter] Leaderboard presentation failed:', errorMessage);
      this.updateStatus({ lastError: errorMessage });
    }
  }

  public async presentAchievements(): Promise<void> {
    const status = this.getStatus();
    
    if (!status.isAuthenticated || !ExpoGameCenterModule) {
      console.warn('[GameCenter] Cannot present achievements: not authenticated');
      return;
    }

    try {
      await ExpoGameCenterModule.presentAchievements();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Achievements presentation failed';
      console.error('[GameCenter] Achievements presentation failed:', errorMessage);
      this.updateStatus({ lastError: errorMessage });
    }
  }

  public async presentGameCenter(): Promise<void> {
    const status = this.getStatus();
    
    if (!status.isAuthenticated || !ExpoGameCenterModule) {
      console.warn('[GameCenter] Cannot present GameCenter: not authenticated');
      return;
    }

    try {
      await ExpoGameCenterModule.presentGameCenterViewController();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'GameCenter presentation failed';
      console.error('[GameCenter] GameCenter presentation failed:', errorMessage);
      this.updateStatus({ lastError: errorMessage });
    }
  }

  public reset(): void {
    this.connectionStatus = {
      state: 'uninitialized',
      isAvailable: false,
      isAuthenticated: false,
      player: null,
      lastError: null,
      lastCheck: 0,
    };
    this.notifyListeners();
  }
}

export default GameCenterConnectionManager;