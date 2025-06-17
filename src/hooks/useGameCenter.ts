import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { GameCenterService, GameCenterConfig } from '../GameCenterService';
import { ConnectionStatus, ConnectionState } from '../GameCenterConnectionManager';
import { GameCenterPlayer } from '../index';

export interface UseGameCenterOptions extends GameCenterConfig {
  autoInitialize?: boolean;
  autoAuthenticate?: boolean;
}

export interface UseGameCenterReturn {
  // Status
  status: ConnectionStatus;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Player info
  player: GameCenterPlayer | null;
  
  // Actions
  initialize: () => Promise<void>;
  authenticate: () => Promise<boolean>;
  submitScore: (score: number, leaderboardKey: string) => Promise<boolean>;
  reportAchievement: (achievementKey: string, progress?: number) => Promise<boolean>;
  showLeaderboard: (leaderboardKey: string) => Promise<void>;
  showAchievements: () => Promise<void>;
  showGameCenter: () => Promise<void>;
  reset: () => void;
  
  // Utilities
  getStateDescription: () => string;
  isPlatformSupported: boolean;
}

export function useGameCenter(options: UseGameCenterOptions = {}): UseGameCenterReturn {
  const {
    autoInitialize = true,
    autoAuthenticate = false,
    enableLogging = false,
    ...config
  } = options;

  const serviceRef = useRef<GameCenterService | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>({
    state: 'uninitialized',
    isAvailable: false,
    isAuthenticated: false,
    player: null,
    lastError: null,
    lastCheck: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize service
  const getService = useCallback(() => {
    if (!serviceRef.current) {
      serviceRef.current = new GameCenterService({
        ...config,
        enableLogging,
      });
    }
    return serviceRef.current;
  }, [config, enableLogging]);

  // Initialize GameCenter
  const initialize = useCallback(async () => {
    if (Platform.OS !== 'ios') {
      setError('GameCenter is only available on iOS');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const service = getService();
      const newStatus = await service.initialize();
      setStatus(newStatus);
      
      if (newStatus.lastError) {
        setError(newStatus.lastError);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Initialization failed';
      setError(errorMessage);
      console.error('[useGameCenter] Initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getService]);

  // Authenticate with GameCenter
  const authenticate = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const service = getService();
      const success = await service.authenticate();
      
      // Update status after authentication attempt
      const newStatus = service.getStatus();
      setStatus(newStatus);
      
      if (!success && newStatus.lastError) {
        setError(newStatus.lastError);
      }
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      console.error('[useGameCenter] Authentication error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getService]);

  // Submit score
  const submitScore = useCallback(async (score: number, leaderboardKey: string): Promise<boolean> => {
    try {
      const service = getService();
      const result = await service.submitScore(score, leaderboardKey);
      
      if (!result.success && result.error) {
        setError(result.error);
      }
      
      return result.success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Score submission failed';
      setError(errorMessage);
      console.error('[useGameCenter] Score submission error:', err);
      return false;
    }
  }, [getService]);

  // Report achievement
  const reportAchievement = useCallback(async (achievementKey: string, progress = 100): Promise<boolean> => {
    try {
      const service = getService();
      const result = await service.reportAchievement(achievementKey, progress);
      
      if (!result.success && result.error) {
        setError(result.error);
      }
      
      return result.success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Achievement reporting failed';
      setError(errorMessage);
      console.error('[useGameCenter] Achievement reporting error:', err);
      return false;
    }
  }, [getService]);

  // Show leaderboard
  const showLeaderboard = useCallback(async (leaderboardKey: string): Promise<void> => {
    try {
      const service = getService();
      await service.showLeaderboard(leaderboardKey);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to show leaderboard';
      setError(errorMessage);
      console.error('[useGameCenter] Show leaderboard error:', err);
    }
  }, [getService]);

  // Show achievements
  const showAchievements = useCallback(async (): Promise<void> => {
    try {
      const service = getService();
      await service.showAchievements();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to show achievements';
      setError(errorMessage);
      console.error('[useGameCenter] Show achievements error:', err);
    }
  }, [getService]);

  // Show GameCenter
  const showGameCenter = useCallback(async (): Promise<void> => {
    try {
      const service = getService();
      await service.showGameCenter();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to show GameCenter';
      setError(errorMessage);
      console.error('[useGameCenter] Show GameCenter error:', err);
    }
  }, [getService]);

  // Reset
  const reset = useCallback(() => {
    const service = getService();
    service.reset();
    setStatus(service.getStatus());
    setError(null);
  }, [getService]);

  // Get state description
  const getStateDescription = useCallback((): string => {
    const service = getService();
    return service.getConnectionStateDescription(status.state);
  }, [getService, status.state]);

  // Set up status listener
  useEffect(() => {
    const service = getService();
    const removeListener = service.addStatusListener((newStatus: ConnectionStatus) => {
      setStatus(newStatus);
      if (newStatus.lastError) {
        setError(newStatus.lastError);
      }
    });

    return removeListener;
  }, [getService]);

  // Auto-initialize
  useEffect(() => {
    if (autoInitialize && Platform.OS === 'ios') {
      initialize();
    }
  }, [autoInitialize, initialize]);

  // Auto-authenticate after initialization
  useEffect(() => {
    if (autoAuthenticate && status.state === 'not_available' && status.isAvailable) {
      authenticate();
    }
  }, [autoAuthenticate, status.state, status.isAvailable, authenticate]);

  return {
    // Status
    status,
    isReady: status.state === 'authenticated' && status.isAuthenticated,
    isLoading,
    error,
    
    // Player info
    player: status.player,
    
    // Actions
    initialize,
    authenticate,
    submitScore,
    reportAchievement,
    showLeaderboard,
    showAchievements,
    showGameCenter,
    reset,
    
    // Utilities
    getStateDescription,
    isPlatformSupported: Platform.OS === 'ios',
  };
}

export default useGameCenter;