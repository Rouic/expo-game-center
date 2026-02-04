"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGameCenter = useGameCenter;
const react_1 = require("react");
const react_native_1 = require("react-native");
const GameCenterService_1 = require("../GameCenterService");
function useGameCenter(options = {}) {
    const { autoInitialize = true, autoAuthenticate = false, enableLogging = false, ...config } = options;
    const serviceRef = (0, react_1.useRef)(null);
    const [status, setStatus] = (0, react_1.useState)({
        state: 'uninitialized',
        isAvailable: false,
        isAuthenticated: false,
        player: null,
        lastError: null,
        lastCheck: 0,
    });
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    // Initialize service
    const getService = (0, react_1.useCallback)(() => {
        if (!serviceRef.current) {
            serviceRef.current = new GameCenterService_1.GameCenterService({
                ...config,
                enableLogging,
            });
        }
        return serviceRef.current;
    }, [config, enableLogging]);
    // Initialize GameCenter
    const initialize = (0, react_1.useCallback)(async () => {
        if (react_native_1.Platform.OS !== 'ios') {
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
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Initialization failed';
            setError(errorMessage);
            console.error('[useGameCenter] Initialization error:', err);
        }
        finally {
            setIsLoading(false);
        }
    }, [getService]);
    // Authenticate with GameCenter
    const authenticate = (0, react_1.useCallback)(async () => {
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
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
            setError(errorMessage);
            console.error('[useGameCenter] Authentication error:', err);
            return false;
        }
        finally {
            setIsLoading(false);
        }
    }, [getService]);
    // Submit score
    const submitScore = (0, react_1.useCallback)(async (score, leaderboardKey) => {
        try {
            const service = getService();
            const result = await service.submitScore(score, leaderboardKey);
            if (!result.success && result.error) {
                setError(result.error);
            }
            return result.success;
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Score submission failed';
            setError(errorMessage);
            console.error('[useGameCenter] Score submission error:', err);
            return false;
        }
    }, [getService]);
    // Report achievement
    const reportAchievement = (0, react_1.useCallback)(async (achievementKey, progress = 100) => {
        try {
            const service = getService();
            const result = await service.reportAchievement(achievementKey, progress);
            if (!result.success && result.error) {
                setError(result.error);
            }
            return result.success;
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Achievement reporting failed';
            setError(errorMessage);
            console.error('[useGameCenter] Achievement reporting error:', err);
            return false;
        }
    }, [getService]);
    // Show leaderboard
    const showLeaderboard = (0, react_1.useCallback)(async (leaderboardKey) => {
        try {
            const service = getService();
            await service.showLeaderboard(leaderboardKey);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to show leaderboard';
            setError(errorMessage);
            console.error('[useGameCenter] Show leaderboard error:', err);
        }
    }, [getService]);
    // Show achievements
    const showAchievements = (0, react_1.useCallback)(async () => {
        try {
            const service = getService();
            await service.showAchievements();
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to show achievements';
            setError(errorMessage);
            console.error('[useGameCenter] Show achievements error:', err);
        }
    }, [getService]);
    // Show GameCenter
    const showGameCenter = (0, react_1.useCallback)(async () => {
        try {
            const service = getService();
            await service.showGameCenter();
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to show GameCenter';
            setError(errorMessage);
            console.error('[useGameCenter] Show GameCenter error:', err);
        }
    }, [getService]);
    // Reset
    const reset = (0, react_1.useCallback)(() => {
        const service = getService();
        service.reset();
        setStatus(service.getStatus());
        setError(null);
    }, [getService]);
    // Get state description
    const getStateDescription = (0, react_1.useCallback)(() => {
        const service = getService();
        return service.getConnectionStateDescription(status.state);
    }, [getService, status.state]);
    // Set up status listener
    (0, react_1.useEffect)(() => {
        const service = getService();
        const removeListener = service.addStatusListener((newStatus) => {
            setStatus(newStatus);
            if (newStatus.lastError) {
                setError(newStatus.lastError);
            }
        });
        return removeListener;
    }, [getService]);
    // Auto-initialize
    (0, react_1.useEffect)(() => {
        if (autoInitialize && react_native_1.Platform.OS === 'ios') {
            initialize();
        }
    }, [autoInitialize, initialize]);
    // Auto-authenticate after initialization
    (0, react_1.useEffect)(() => {
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
        isPlatformSupported: react_native_1.Platform.OS === 'ios',
    };
}
exports.default = useGameCenter;
//# sourceMappingURL=useGameCenter.js.map