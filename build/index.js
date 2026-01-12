"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGameCenter = exports.GameCenterService = exports.GameCenterConnectionManager = void 0;
const ExpoGameCenterModule_1 = __importDefault(require("./ExpoGameCenterModule"));
// Export connection manager (no React dependencies)
var GameCenterConnectionManager_1 = require("./GameCenterConnectionManager");
Object.defineProperty(exports, "GameCenterConnectionManager", { enumerable: true, get: function () { return GameCenterConnectionManager_1.GameCenterConnectionManager; } });
// Export service layer and hooks (users must have React/React Native as peer deps)
var GameCenterService_1 = require("./GameCenterService");
Object.defineProperty(exports, "GameCenterService", { enumerable: true, get: function () { return GameCenterService_1.GameCenterService; } });
var hooks_1 = require("./hooks");
Object.defineProperty(exports, "useGameCenter", { enumerable: true, get: function () { return hooks_1.useGameCenter; } });
// Wrap the native module to add build version marker
const WrappedGameCenterModule = {
    isGameCenterAvailable: () => ExpoGameCenterModule_1.default.isGameCenterAvailable(),
    authenticateLocalPlayer: async () => {
        console.log('[ExpoGameCenter] Calling native authenticateLocalPlayer...');
        try {
            const result = await ExpoGameCenterModule_1.default.authenticateLocalPlayer();
            console.log('[ExpoGameCenter] ✅ Authentication result:', result);
            return result;
        }
        catch (error) {
            console.log('[ExpoGameCenter] ❌ Authentication error:', (error === null || error === void 0 ? void 0 : error.message) || error);
            throw error;
        }
    },
    getLocalPlayer: () => ExpoGameCenterModule_1.default.getLocalPlayer(),
    getPlayerImage: () => ExpoGameCenterModule_1.default.getPlayerImage(),
    submitScore: (score, leaderboardID) => ExpoGameCenterModule_1.default.submitScore(score, leaderboardID),
    reportAchievement: (achievementID, percentComplete) => ExpoGameCenterModule_1.default.reportAchievement(achievementID, percentComplete),
    presentLeaderboard: (leaderboardID) => ExpoGameCenterModule_1.default.presentLeaderboard(leaderboardID),
    presentAchievements: () => ExpoGameCenterModule_1.default.presentAchievements(),
    presentGameCenterViewController: () => ExpoGameCenterModule_1.default.presentGameCenterViewController(),
};
// Default export - wrapped module with build markers
exports.default = WrappedGameCenterModule;
//# sourceMappingURL=index.js.map