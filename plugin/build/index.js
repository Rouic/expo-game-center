"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const withExpoGameCenter = (config) => {
    // Add Game Center entitlement
    config = (0, config_plugins_1.withEntitlementsPlist)(config, (config) => {
        config.modResults['com.apple.developer.game-center'] = true;
        return config;
    });
    return config;
};
exports.default = (0, config_plugins_1.createRunOncePlugin)(withExpoGameCenter, 'expo-game-center', '1.0.0');
//# sourceMappingURL=index.js.map