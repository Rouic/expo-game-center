// Mock expo-modules-core
jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn(),
}));

// Mock expo as fallback
jest.mock('expo', () => ({
  requireNativeModule: jest.fn(),
}));

describe('ExpoGameCenterModule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    // Reset console.log spy if it exists
    if (jest.isMockFunction(console.log)) {
      (console.log as jest.MockedFunction<typeof console.log>).mockClear();
    }
  });

  describe('Module Loading', () => {
    it('should load native module via expo-modules-core successfully', () => {
      const mockModule = {
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
      };

      const { requireNativeModule } = require('expo-modules-core');
      (requireNativeModule as jest.Mock).mockReturnValue(mockModule);

      // Import module after setting up mocks
      const reloadedModule = require('../ExpoGameCenterModule').default;
      
      expect(requireNativeModule).toHaveBeenCalledWith('ExpoGameCenter');
      expect(reloadedModule).toBe(mockModule);
    });

    it('should fallback to expo requireNativeModule when expo-modules-core fails', () => {
      const mockModule = {
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
      };

      const expoModulesCore = require('expo-modules-core');
      const expo = require('expo');
      
      (expoModulesCore.requireNativeModule as jest.Mock).mockImplementation(() => {
        throw new Error('expo-modules-core failed');
      });
      (expo.requireNativeModule as jest.Mock).mockReturnValue(mockModule);

      // Import module after setting up mocks
      const reloadedModule = require('../ExpoGameCenterModule').default;
      
      expect(expo.requireNativeModule).toHaveBeenCalledWith('ExpoGameCenter');
      expect(reloadedModule).toBe(mockModule);
    });

    it('should return null when both loading methods fail', () => {
      const expoModulesCore = require('expo-modules-core');
      const expo = require('expo');
      
      (expoModulesCore.requireNativeModule as jest.Mock).mockImplementation(() => {
        throw new Error('expo-modules-core failed');
      });
      (expo.requireNativeModule as jest.Mock).mockImplementation(() => {
        throw new Error('expo fallback failed');
      });

      // Import module after setting up mocks
      const reloadedModule = require('../ExpoGameCenterModule').default;
      
      expect(reloadedModule).toBeNull();
    });
  });

  describe('Module Functionality', () => {
    it('should handle successful module loading', () => {
      const mockModule = {
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
      };

      const { requireNativeModule } = require('expo-modules-core');
      (requireNativeModule as jest.Mock).mockReturnValue(mockModule);

      const reloadedModule = require('../ExpoGameCenterModule').default;
      expect(reloadedModule).toBeDefined();
      expect(reloadedModule).toBe(mockModule);
    });
  });
});