import { ConfigPlugin, createRunOncePlugin, withEntitlementsPlist } from '@expo/config-plugins';

const withExpoGameCenter: ConfigPlugin = (config) => {
  // Add Game Center entitlement
  config = withEntitlementsPlist(config, (config) => {
    config.modResults['com.apple.developer.game-center'] = true;
    return config;
  });

  return config;
};

export default createRunOncePlugin(withExpoGameCenter, 'expo-game-center', '1.0.0');