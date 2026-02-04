"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameCenterConnectionManager = void 0;
const index_1 = __importDefault(require("./index"));
class GameCenterConnectionManager {
    constructor() {
        this.connectionStatus = {
            state: 'uninitialized',
            isAvailable: false,
            isAuthenticated: false,
            player: null,
            lastError: null,
            lastCheck: 0,
        };
        this.listeners = new Set();
        this.isCheckingConnection = false;
        this.CACHE_DURATION = 5000; // 5 seconds
        // Private constructor for singleton
    }
    static getInstance() {
        if (!GameCenterConnectionManager.instance) {
            GameCenterConnectionManager.instance = new GameCenterConnectionManager();
        }
        return GameCenterConnectionManager.instance;
    }
    getStatus() {
        return { ...this.connectionStatus };
    }
    getModule() {
        return index_1.default;
    }
    addListener(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    notifyListeners() {
        this.listeners.forEach(listener => {
            try {
                listener(this.getStatus());
            }
            catch (error) {
                console.error('[GameCenter] Listener error:', error);
            }
        });
    }
    updateStatus(updates) {
        this.connectionStatus = {
            ...this.connectionStatus,
            ...updates,
            lastCheck: Date.now(),
        };
        this.notifyListeners();
    }
    async checkConnection(force = false) {
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
            const isAvailable = await index_1.default.isGameCenterAvailable();
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
            const isAuthenticated = await index_1.default.authenticateLocalPlayer();
            if (isAuthenticated) {
                const player = await index_1.default.getLocalPlayer();
                this.updateStatus({
                    state: 'authenticated',
                    isAvailable: true,
                    isAuthenticated: true,
                    player,
                });
            }
            else {
                this.updateStatus({
                    state: 'not_available', // User not signed in
                    isAvailable: true,
                    isAuthenticated: false,
                    player: null,
                });
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('[GameCenter] Connection check failed:', errorMessage);
            this.updateStatus({
                state: 'error',
                isAvailable: false,
                isAuthenticated: false,
                player: null,
                lastError: errorMessage,
            });
        }
        finally {
            this.isCheckingConnection = false;
        }
        return this.getStatus();
    }
    async authenticate() {
        const status = await this.checkConnection(true);
        return status.isAuthenticated;
    }
    async submitScore(score, leaderboardID) {
        const status = this.getStatus();
        if (!status.isAuthenticated || !index_1.default) {
            console.warn('[GameCenter] Cannot submit score: not authenticated');
            return false;
        }
        try {
            return await index_1.default.submitScore(score, leaderboardID);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Score submission failed';
            console.error('[GameCenter] Score submission failed:', errorMessage);
            this.updateStatus({ lastError: errorMessage });
            return false;
        }
    }
    async reportAchievement(achievementID, percentComplete) {
        const status = this.getStatus();
        if (!status.isAuthenticated || !index_1.default) {
            console.warn('[GameCenter] Cannot report achievement: not authenticated');
            return false;
        }
        try {
            return await index_1.default.reportAchievement(achievementID, percentComplete);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Achievement reporting failed';
            console.error('[GameCenter] Achievement reporting failed:', errorMessage);
            this.updateStatus({ lastError: errorMessage });
            return false;
        }
    }
    async presentLeaderboard(leaderboardID) {
        const status = this.getStatus();
        if (!status.isAuthenticated || !index_1.default) {
            console.warn('[GameCenter] Cannot present leaderboard: not authenticated');
            return;
        }
        try {
            await index_1.default.presentLeaderboard(leaderboardID);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Leaderboard presentation failed';
            console.error('[GameCenter] Leaderboard presentation failed:', errorMessage);
            this.updateStatus({ lastError: errorMessage });
        }
    }
    async presentAchievements() {
        const status = this.getStatus();
        if (!status.isAuthenticated || !index_1.default) {
            console.warn('[GameCenter] Cannot present achievements: not authenticated');
            return;
        }
        try {
            await index_1.default.presentAchievements();
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Achievements presentation failed';
            console.error('[GameCenter] Achievements presentation failed:', errorMessage);
            this.updateStatus({ lastError: errorMessage });
        }
    }
    async presentGameCenter() {
        const status = this.getStatus();
        if (!status.isAuthenticated || !index_1.default) {
            console.warn('[GameCenter] Cannot present GameCenter: not authenticated');
            return;
        }
        try {
            await index_1.default.presentGameCenterViewController();
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'GameCenter presentation failed';
            console.error('[GameCenter] GameCenter presentation failed:', errorMessage);
            this.updateStatus({ lastError: errorMessage });
        }
    }
    reset() {
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
exports.GameCenterConnectionManager = GameCenterConnectionManager;
exports.default = GameCenterConnectionManager;
//# sourceMappingURL=GameCenterConnectionManager.js.map