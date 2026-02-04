"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Use expo-modules-core for better reliability
let GameCenterNativeModule = null;
try {
    const { requireNativeModule } = require('expo-modules-core');
    GameCenterNativeModule = requireNativeModule('ExpoGameCenter');
    console.log('[ExpoGameCenter] Native module loaded successfully via expo-modules-core');
}
catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log('[ExpoGameCenter] Failed to load native module:', errorMessage);
    // Try alternative method
    try {
        const { requireNativeModule } = require('expo');
        GameCenterNativeModule = requireNativeModule('ExpoGameCenter');
        console.log('[ExpoGameCenter] Native module loaded successfully via expo');
    }
    catch (fallbackError) {
        const fallbackErrorMessage = fallbackError instanceof Error ? fallbackError.message : 'Unknown error';
        console.log('[ExpoGameCenter] All native module loading attempts failed:', fallbackErrorMessage);
        GameCenterNativeModule = null;
    }
}
exports.default = GameCenterNativeModule;
//# sourceMappingURL=ExpoGameCenterModule.js.map