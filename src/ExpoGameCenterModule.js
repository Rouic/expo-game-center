// Development fallback for GameCenter module
// This will be used when the native module is not available (e.g., in Expo Go or development)

class MockGameCenterModule {
  async isGameCenterAvailable() {
    console.log('[GameCenter] MockGameCenterModule: isGameCenterAvailable called');
    return false; // Always return false in development mode
  }

  async authenticateLocalPlayer() {
    console.log('[GameCenter] MockGameCenterModule: authenticateLocalPlayer called');
    return false;
  }

  async getLocalPlayer() {
    console.log('[GameCenter] MockGameCenterModule: getLocalPlayer called');
    return null;
  }

  async getPlayerImage() {
    console.log('[GameCenter] MockGameCenterModule: getPlayerImage called');
    return null;
  }

  async submitScore(score, leaderboardID) {
    console.log('[GameCenter] MockGameCenterModule: submitScore called', { score, leaderboardID });
    return false;
  }

  async reportAchievement(achievementID, percentComplete) {
    console.log('[GameCenter] MockGameCenterModule: reportAchievement called', { achievementID, percentComplete });
    return false;
  }

  async presentLeaderboard(leaderboardID) {
    console.log('[GameCenter] MockGameCenterModule: presentLeaderboard called', { leaderboardID });
    return;
  }

  async presentAchievements() {
    console.log('[GameCenter] MockGameCenterModule: presentAchievements called');
    return;
  }

  async presentGameCenterViewController() {
    console.log('[GameCenter] MockGameCenterModule: presentGameCenterViewController called');
    return;
  }
}

export default new MockGameCenterModule();