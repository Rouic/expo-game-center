import ExpoGameCenterModule from '../index';

// Mock the native module for integration tests
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

describe('Game Center Integration', () => {
  let mockNativeModule: jest.Mocked<any>;
  
  beforeEach(() => {
    mockNativeModule = require('../ExpoGameCenterModule').default;
    jest.clearAllMocks();
  });

  describe('Authentication Flow', () => {
    it('should authenticate player and get player info', async () => {
      // Mock successful authentication
      mockNativeModule.isGameCenterAvailable.mockResolvedValue(true);
      mockNativeModule.authenticateLocalPlayer.mockResolvedValue(true);
      mockNativeModule.getLocalPlayer.mockResolvedValue({
        playerID: 'player123',
        displayName: 'John Doe',
        alias: 'JohnD',
      });
      mockNativeModule.getPlayerImage.mockResolvedValue('base64-image-data');

      // Test the flow
      const isAvailable = await ExpoGameCenterModule.isGameCenterAvailable();
      expect(isAvailable).toBe(true);

      const isAuthenticated = await ExpoGameCenterModule.authenticateLocalPlayer();
      expect(isAuthenticated).toBe(true);

      const player = await ExpoGameCenterModule.getLocalPlayer();
      expect(player).toEqual({
        playerID: 'player123',
        displayName: 'John Doe',
        alias: 'JohnD',
      });

      const playerImage = await ExpoGameCenterModule.getPlayerImage();
      expect(playerImage).toBe('base64-image-data');
    });

    it('should handle authentication failure gracefully', async () => {
      mockNativeModule.isGameCenterAvailable.mockResolvedValue(true);
      mockNativeModule.authenticateLocalPlayer.mockResolvedValue(false);
      mockNativeModule.getLocalPlayer.mockResolvedValue(null);

      const isAvailable = await ExpoGameCenterModule.isGameCenterAvailable();
      expect(isAvailable).toBe(true);

      const isAuthenticated = await ExpoGameCenterModule.authenticateLocalPlayer();
      expect(isAuthenticated).toBe(false);

      const player = await ExpoGameCenterModule.getLocalPlayer();
      expect(player).toBe(null);
    });
  });

  describe('Leaderboard Operations', () => {
    it('should submit score and present leaderboard', async () => {
      mockNativeModule.submitScore.mockResolvedValue(true);
      mockNativeModule.presentLeaderboard.mockResolvedValue(undefined);

      // Submit a score
      const scoreSubmitted = await ExpoGameCenterModule.submitScore(9999, 'high_scores');
      expect(scoreSubmitted).toBe(true);
      expect(mockNativeModule.submitScore).toHaveBeenCalledWith(9999, 'high_scores');

      // Present leaderboard
      await ExpoGameCenterModule.presentLeaderboard('high_scores');
      expect(mockNativeModule.presentLeaderboard).toHaveBeenCalledWith('high_scores');
    });

    it('should handle score submission failure', async () => {
      mockNativeModule.submitScore.mockResolvedValue(false);

      const scoreSubmitted = await ExpoGameCenterModule.submitScore(1000, 'invalid_leaderboard');
      expect(scoreSubmitted).toBe(false);
    });
  });

  describe('Achievement Operations', () => {
    it('should report achievement and present achievements', async () => {
      mockNativeModule.reportAchievement.mockResolvedValue(true);
      mockNativeModule.presentAchievements.mockResolvedValue(undefined);

      // Report achievement progress
      const achievementReported = await ExpoGameCenterModule.reportAchievement('first_win', 100);
      expect(achievementReported).toBe(true);
      expect(mockNativeModule.reportAchievement).toHaveBeenCalledWith('first_win', 100);

      // Present achievements
      await ExpoGameCenterModule.presentAchievements();
      expect(mockNativeModule.presentAchievements).toHaveBeenCalled();
    });

    it('should handle partial achievement progress', async () => {
      mockNativeModule.reportAchievement.mockResolvedValue(true);

      const achievementReported = await ExpoGameCenterModule.reportAchievement('milestone_50', 50.5);
      expect(achievementReported).toBe(true);
      expect(mockNativeModule.reportAchievement).toHaveBeenCalledWith('milestone_50', 50.5);
    });
  });

  describe('Game Center UI', () => {
    it('should present Game Center view controller', async () => {
      mockNativeModule.presentGameCenterViewController.mockResolvedValue(undefined);

      await ExpoGameCenterModule.presentGameCenterViewController();
      expect(mockNativeModule.presentGameCenterViewController).toHaveBeenCalled();
    });
  });

  describe('Error Scenarios', () => {
    it('should handle Game Center unavailable scenario', async () => {
      mockNativeModule.isGameCenterAvailable.mockResolvedValue(false);

      const isAvailable = await ExpoGameCenterModule.isGameCenterAvailable();
      expect(isAvailable).toBe(false);

      // Should not proceed with authentication when unavailable
      expect(mockNativeModule.authenticateLocalPlayer).not.toHaveBeenCalled();
    });

    it('should handle network errors during score submission', async () => {
      const networkError = new Error('Network request failed');
      mockNativeModule.submitScore.mockRejectedValue(networkError);

      await expect(ExpoGameCenterModule.submitScore(5000, 'leaderboard_id'))
        .rejects.toThrow('Network request failed');
    });

    it('should handle invalid achievement data', async () => {
      const validationError = new Error('Invalid achievement ID');
      mockNativeModule.reportAchievement.mockRejectedValue(validationError);

      await expect(ExpoGameCenterModule.reportAchievement('', 100))
        .rejects.toThrow('Invalid achievement ID');
    });
  });

  describe('Parameter Validation', () => {
    it('should pass correct types for score submission', async () => {
      mockNativeModule.submitScore.mockResolvedValue(true);

      await ExpoGameCenterModule.submitScore(12345, 'test_leaderboard');
      
      expect(mockNativeModule.submitScore).toHaveBeenCalledWith(
        expect.any(Number),
        expect.any(String)
      );
    });

    it('should pass correct types for achievement reporting', async () => {
      mockNativeModule.reportAchievement.mockResolvedValue(true);

      await ExpoGameCenterModule.reportAchievement('achievement_id', 75.25);
      
      expect(mockNativeModule.reportAchievement).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Number)
      );
    });
  });
});