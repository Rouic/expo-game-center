import ExpoGameCenterModule, { GameCenterPlayer, GameCenterModule } from '../index';

// Mock the native module
jest.mock('../ExpoGameCenterModule', () => ({
  __esModule: true,
  default: {
    isGameCenterAvailable: jest.fn(),
    authenticateLocalPlayer: jest.fn(),
    getConstants: jest.fn(),
    getLocalPlayer: jest.fn(),
    getPlayerImage: jest.fn(),
    submitScore: jest.fn(),
    reportAchievement: jest.fn(),
    presentLeaderboard: jest.fn(),
    presentAchievements: jest.fn(),
    presentGameCenterViewController: jest.fn(),
  },
}));

describe('Expo Game Center Index', () => {
  let mockNativeModule: jest.Mocked<any>;
  
  beforeEach(() => {
    mockNativeModule = require('../ExpoGameCenterModule').default;
    jest.clearAllMocks();
  });

  describe('TypeScript Interfaces', () => {
    it('should export GameCenterPlayer interface', () => {
      const player: GameCenterPlayer = {
        playerID: 'test-player-id',
        displayName: 'Test Player',
        alias: 'TestAlias',
      };
      
      expect(player.playerID).toBe('test-player-id');
      expect(player.displayName).toBe('Test Player');
      expect(player.alias).toBe('TestAlias');
    });

    it('should export GameCenterModule interface', () => {
      const module: GameCenterModule = ExpoGameCenterModule;
      
      expect(module).toBeDefined();
      expect(typeof module.isGameCenterAvailable).toBe('function');
      expect(typeof module.authenticateLocalPlayer).toBe('function');
      expect(typeof module.getLocalPlayer).toBe('function');
      expect(typeof module.getPlayerImage).toBe('function');
      expect(typeof module.submitScore).toBe('function');
      expect(typeof module.reportAchievement).toBe('function');
      expect(typeof module.presentLeaderboard).toBe('function');
      expect(typeof module.presentAchievements).toBe('function');
      expect(typeof module.presentGameCenterViewController).toBe('function');
    });
  });

  describe('Module Methods', () => {
    it('should call isGameCenterAvailable', async () => {
      mockNativeModule.isGameCenterAvailable.mockResolvedValue(true);
      
      const result = await ExpoGameCenterModule.isGameCenterAvailable();
      
      expect(mockNativeModule.isGameCenterAvailable).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should call authenticateLocalPlayer', async () => {
      mockNativeModule.authenticateLocalPlayer.mockResolvedValue(true);
      
      const result = await ExpoGameCenterModule.authenticateLocalPlayer();
      
      expect(mockNativeModule.authenticateLocalPlayer).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should call getLocalPlayer', async () => {
      const mockPlayer: GameCenterPlayer = {
        playerID: 'test-id',
        displayName: 'Test Player',
        alias: 'TestAlias',
      };
      mockNativeModule.getLocalPlayer.mockResolvedValue(mockPlayer);
      
      const result = await ExpoGameCenterModule.getLocalPlayer();
      
      expect(mockNativeModule.getLocalPlayer).toHaveBeenCalled();
      expect(result).toEqual(mockPlayer);
    });

    it('should call getPlayerImage', async () => {
      const mockImageData = 'base64-encoded-image-data';
      mockNativeModule.getPlayerImage.mockResolvedValue(mockImageData);
      
      const result = await ExpoGameCenterModule.getPlayerImage();
      
      expect(mockNativeModule.getPlayerImage).toHaveBeenCalled();
      expect(result).toBe(mockImageData);
    });

    it('should call submitScore with correct parameters', async () => {
      mockNativeModule.submitScore.mockResolvedValue(true);
      
      const result = await ExpoGameCenterModule.submitScore(1000, 'test-leaderboard');
      
      expect(mockNativeModule.submitScore).toHaveBeenCalledWith(1000, 'test-leaderboard');
      expect(result).toBe(true);
    });

    it('should call reportAchievement with correct parameters', async () => {
      mockNativeModule.reportAchievement.mockResolvedValue(true);
      
      const result = await ExpoGameCenterModule.reportAchievement('test-achievement', 75.5);
      
      expect(mockNativeModule.reportAchievement).toHaveBeenCalledWith('test-achievement', 75.5);
      expect(result).toBe(true);
    });

    it('should call presentLeaderboard with correct parameter', async () => {
      mockNativeModule.presentLeaderboard.mockResolvedValue(undefined);
      
      await ExpoGameCenterModule.presentLeaderboard('test-leaderboard');
      
      expect(mockNativeModule.presentLeaderboard).toHaveBeenCalledWith('test-leaderboard');
    });

    it('should call presentAchievements', async () => {
      mockNativeModule.presentAchievements.mockResolvedValue(undefined);
      
      await ExpoGameCenterModule.presentAchievements();
      
      expect(mockNativeModule.presentAchievements).toHaveBeenCalled();
    });

    it('should call presentGameCenterViewController', async () => {
      mockNativeModule.presentGameCenterViewController.mockResolvedValue(undefined);
      
      await ExpoGameCenterModule.presentGameCenterViewController();
      
      expect(mockNativeModule.presentGameCenterViewController).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle isGameCenterAvailable rejection', async () => {
      const error = new Error('Game Center not available');
      mockNativeModule.isGameCenterAvailable.mockRejectedValue(error);
      
      await expect(ExpoGameCenterModule.isGameCenterAvailable()).rejects.toThrow('Game Center not available');
    });

    it('should handle authenticateLocalPlayer rejection', async () => {
      const error = new Error('Authentication failed');
      mockNativeModule.authenticateLocalPlayer.mockRejectedValue(error);
      
      await expect(ExpoGameCenterModule.authenticateLocalPlayer()).rejects.toThrow('Authentication failed');
    });

    it('should handle submitScore rejection', async () => {
      const error = new Error('Score submission failed');
      mockNativeModule.submitScore.mockRejectedValue(error);
      
      await expect(ExpoGameCenterModule.submitScore(1000, 'test-leaderboard')).rejects.toThrow('Score submission failed');
    });

    it('should handle reportAchievement rejection', async () => {
      const error = new Error('Achievement report failed');
      mockNativeModule.reportAchievement.mockRejectedValue(error);
      
      await expect(ExpoGameCenterModule.reportAchievement('test-achievement', 100)).rejects.toThrow('Achievement report failed');
    });
  });
});