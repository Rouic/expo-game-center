# expo-game-center

A comprehensive Expo module for iOS Game Center integration, providing authentication, leaderboards, achievements, and native UI presentation.

## Features

- 🎮 **Game Center Authentication** - Seamlessly authenticate players with Game Center
- 👤 **Player Information** - Retrieve authenticated player details and profile images  
- 🏆 **Leaderboards** - Submit scores and present leaderboard interfaces
- 🎯 **Achievements** - Report achievement progress with native completion banners
- 📱 **Native UI** - Present Game Center's native user interfaces
- 🔧 **Development Support** - Mock implementations for Expo Go and simulators
- 📦 **TypeScript Support** - Full TypeScript definitions included
- ⚡ **Auto Configuration** - Automatic Game Center entitlements via Expo config plugin

## Installation

```bash
npm install expo-game-center
```

or 

```bash
yarn add expo-game-center
```

## Configuration

### Automatic Configuration (Recommended)

The module includes an Expo config plugin that automatically configures Game Center entitlements for you.

Add the plugin to your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "plugins": [
      "expo-game-center"
    ]
  }
}
```

### Manual Configuration

If you prefer manual configuration or need custom settings, add the Game Center entitlement to your `app.json`:

```json
{
  "expo": {
    "ios": {
      "entitlements": {
        "com.apple.developer.game-center": true
      }
    }
  }
}
```

## Usage

### Basic Setup

```typescript
import * as GameCenter from 'expo-game-center';

// Check if Game Center is available
const isAvailable = await GameCenter.isGameCenterAvailable();

if (isAvailable) {
  // Authenticate the player
  const authenticated = await GameCenter.authenticateLocalPlayer();
  
  if (authenticated) {
    console.log('Player authenticated successfully!');
  }
}
```

### Player Authentication

```typescript
import * as GameCenter from 'expo-game-center';

async function authenticatePlayer() {
  try {
    const authenticated = await GameCenter.authenticateLocalPlayer();
    
    if (authenticated) {
      // Get player information
      const player = await GameCenter.getLocalPlayer();
      console.log('Player:', player);
      
      // Get player's profile image
      const playerImage = await GameCenter.getPlayerImage();
      if (playerImage) {
        // playerImage is a base64-encoded data URI
        console.log('Player image:', playerImage);
      }
    }
  } catch (error) {
    console.error('Authentication failed:', error);
  }
}
```

### Leaderboards

```typescript
// Submit a score
async function submitScore(score: number) {
  try {
    const success = await GameCenter.submitScore(score, 'your_leaderboard_id');
    if (success) {
      console.log('Score submitted successfully!');
    }
  } catch (error) {
    console.error('Failed to submit score:', error);
  }
}

// Present leaderboard UI
async function showLeaderboard() {
  try {
    await GameCenter.presentLeaderboard('your_leaderboard_id');
  } catch (error) {
    console.error('Failed to show leaderboard:', error);
  }
}
```

### Achievements

```typescript
// Report achievement progress
async function reportAchievement(achievementId: string, progress: number) {
  try {
    const success = await GameCenter.reportAchievement(achievementId, progress);
    if (success) {
      console.log('Achievement progress reported!');
    }
  } catch (error) {
    console.error('Failed to report achievement:', error);
  }
}

// Show achievements UI
async function showAchievements() {
  try {
    await GameCenter.presentAchievements();
  } catch (error) {
    console.error('Failed to show achievements:', error);
  }
}
```

### Game Center Dashboard

```typescript
// Present the main Game Center interface
async function showGameCenter() {
  try {
    await GameCenter.presentGameCenterViewController();
  } catch (error) {
    console.error('Failed to show Game Center:', error);
  }
}
```

## API Reference

### Types

```typescript
interface GameCenterPlayer {
  playerID: string;     // Unique Game Center player ID
  displayName: string;  // Player's display name
  alias: string;        // Player's alias/gamertag
}
```

### Methods

#### `isGameCenterAvailable(): Promise<boolean>`

Checks if Game Center is available on the current device.

**Returns:** Promise that resolves to `true` if Game Center is available, `false` otherwise.

#### `authenticateLocalPlayer(): Promise<boolean>`

Authenticates the local player with Game Center. If the player is not signed in, presents the authentication UI.

**Returns:** Promise that resolves to `true` if authentication was successful, `false` otherwise.

#### `getLocalPlayer(): Promise<GameCenterPlayer | null>`

Retrieves information about the authenticated local player.

**Returns:** Promise that resolves to a `GameCenterPlayer` object or `null` if no player is authenticated.

#### `getPlayerImage(): Promise<string | null>`

Retrieves the authenticated player's profile image.

**Returns:** Promise that resolves to a base64-encoded data URI string or `null` if no image is available.

#### `submitScore(score: number, leaderboardID: string): Promise<boolean>`

Submits a score to a specified leaderboard.

**Parameters:**
- `score`: The score value to submit
- `leaderboardID`: The identifier of the target leaderboard

**Returns:** Promise that resolves to `true` if the score was submitted successfully, `false` otherwise.

#### `reportAchievement(achievementID: string, percentComplete: number): Promise<boolean>`

Reports progress on an achievement.

**Parameters:**
- `achievementID`: The identifier of the achievement
- `percentComplete`: Progress percentage (0-100)

**Returns:** Promise that resolves to `true` if the achievement was reported successfully, `false` otherwise.

#### `presentLeaderboard(leaderboardID: string): Promise<void>`

Presents the native leaderboard interface for a specific leaderboard.

**Parameters:**
- `leaderboardID`: The identifier of the leaderboard to display

#### `presentAchievements(): Promise<void>`

Presents the native achievements interface.

#### `presentGameCenterViewController(): Promise<void>`

Presents the main Game Center interface.

## Platform Support

- ✅ **iOS**: Full native support (iOS 13.0+)
- ❌ **Android**: Not supported (Game Center is iOS-only)
- 🔧 **Development**: Mock implementation available for testing

## Development Mode

When running in Expo Go or on simulators, the module provides mock implementations that return placeholder data. This allows you to develop and test your Game Center integration without requiring a physical device or Game Center authentication.

## Troubleshooting

### Common Issues

**Game Center not available**
- Ensure you're testing on a physical iOS device (not simulator)
- Verify Game Center is enabled in device Settings
- Check that your app has Game Center entitlements configured

**Authentication fails**
- Make sure the player is signed into Game Center in Settings
- Verify your app's bundle identifier matches your Game Center configuration
- Ensure Game Center is enabled for your app in App Store Connect

**Leaderboards/Achievements not working**
- Verify leaderboard/achievement IDs match those configured in App Store Connect
- Ensure your app has been approved for Game Center (for production apps)
- Check that you're using the correct sandbox/production environment

### Debug Mode

Enable debug logging by setting the `EXPO_GAME_CENTER_DEBUG` environment variable:

```bash
EXPO_GAME_CENTER_DEBUG=true expo start
```

## Requirements

- Expo SDK 49.0.0 or higher
- iOS 13.0 or higher
- Xcode 12.0 or higher (for building)
- Game Center configuration in App Store Connect

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Expo Modules](https://docs.expo.dev/modules/overview/)
- Inspired by the iOS Game Center framework
- Thanks to the Expo community for feedback and contributions