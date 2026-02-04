import { GameCenterConfig } from '../GameCenterService';
import { ConnectionStatus } from '../GameCenterConnectionManager';
import { GameCenterPlayer } from '../index';
export interface UseGameCenterOptions extends GameCenterConfig {
    autoInitialize?: boolean;
    autoAuthenticate?: boolean;
}
export interface UseGameCenterReturn {
    status: ConnectionStatus;
    isReady: boolean;
    isLoading: boolean;
    error: string | null;
    player: GameCenterPlayer | null;
    initialize: () => Promise<void>;
    authenticate: () => Promise<boolean>;
    submitScore: (score: number, leaderboardKey: string) => Promise<boolean>;
    reportAchievement: (achievementKey: string, progress?: number) => Promise<boolean>;
    showLeaderboard: (leaderboardKey: string) => Promise<void>;
    showAchievements: () => Promise<void>;
    showGameCenter: () => Promise<void>;
    reset: () => void;
    getStateDescription: () => string;
    isPlatformSupported: boolean;
}
export declare function useGameCenter(options?: UseGameCenterOptions): UseGameCenterReturn;
export default useGameCenter;
//# sourceMappingURL=useGameCenter.d.ts.map