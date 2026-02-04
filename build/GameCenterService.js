"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameCenterService = void 0;
const react_native_1 = require("react-native");
const GameCenterConnectionManager_1 = require("./GameCenterConnectionManager");
class GameCenterService {
    constructor(config = {}) {
        this.connectionManager = GameCenterConnectionManager_1.GameCenterConnectionManager.getInstance();
        this.config = config;
        this.logger = config.enableLogging
            ? (message, data) => console.log(`[GameCenterService] ${message}`, data || '')
            : () => { };
    }
    /**
     * Initialize GameCenter and check connection status
     */
    async initialize() {
        this.logger('Initializing GameCenter service');
        if (react_native_1.Platform.OS !== 'ios') {
            this.logger('Platform is not iOS, GameCenter not available');
            return this.connectionManager.getStatus();
        }
        return await this.connectionManager.checkConnection(true);
    }
    /**
     * Get current connection status
     */
    getStatus() {
        return this.connectionManager.getStatus();
    }
    /**
     * Check if GameCenter is available and ready to use
     */
    isReady() {
        const status = this.getStatus();
        return status.state === 'authenticated' && status.isAuthenticated;
    }
    /**
     * Authenticate with GameCenter
     */
    async authenticate() {
        this.logger('Attempting authentication');
        if (react_native_1.Platform.OS !== 'ios') {
            this.logger('Authentication failed: not iOS platform');
            return false;
        }
        try {
            return await this.connectionManager.authenticate();
        }
        catch (error) {
            this.logger('Authentication failed', error);
            return false;
        }
    }
    /**
     * Get authenticated player information
     */
    getPlayer() {
        return this.getStatus().player;
    }
    /**
     * Submit score to a leaderboard
     */
    async submitScore(score, leaderboardKey) {
        var _a;
        const leaderboardID = ((_a = this.config.leaderboards) === null || _a === void 0 ? void 0 : _a[leaderboardKey]) || leaderboardKey;
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger('Score submission error', errorMessage);
            return { success: false, error: errorMessage };
        }
    }
    /**
     * Report achievement progress
     */
    async reportAchievement(achievementKey, percentComplete = 100) {
        var _a;
        const achievementID = ((_a = this.config.achievements) === null || _a === void 0 ? void 0 : _a[achievementKey]) || achievementKey;
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger('Achievement reporting error', errorMessage);
            return { success: false, error: errorMessage };
        }
    }
    /**
     * Present leaderboard UI
     */
    async showLeaderboard(leaderboardKey) {
        var _a;
        const leaderboardID = ((_a = this.config.leaderboards) === null || _a === void 0 ? void 0 : _a[leaderboardKey]) || leaderboardKey;
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
    async showAchievements() {
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
    async showGameCenter() {
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
    addStatusListener(callback) {
        return this.connectionManager.addListener(callback);
    }
    /**
     * Check if platform supports GameCenter
     */
    static isPlatformSupported() {
        return react_native_1.Platform.OS === 'ios';
    }
    /**
     * Get connection state description
     */
    getConnectionStateDescription(state) {
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
    reset() {
        this.logger('Resetting GameCenter service');
        this.connectionManager.reset();
    }
}
exports.GameCenterService = GameCenterService;
exports.default = GameCenterService;
//# sourceMappingURL=GameCenterService.js.map