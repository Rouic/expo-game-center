# Game Center Example App

This is a comprehensive example app demonstrating how to use the `expo-game-center` module in your Expo/React Native iOS application.

## Features Demonstrated

- 🔐 **Authentication**: Sign in to Game Center
- 👤 **Player Information**: Display player details and avatar
- 🏆 **Leaderboards**: Submit scores and view leaderboards
- 🎖️ **Achievements**: Report achievement progress
- 📱 **Native UI**: Present Game Center views

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Game Center**
   - Create an app in App Store Connect
   - Configure leaderboards and achievements
   - Update the IDs in the code:
     - Replace `'your_leaderboard_id'` with your actual leaderboard ID
     - Replace `'your_achievement_id'` with your actual achievement ID

3. **Run the App**
   ```bash
   npm run ios
   ```
   
   **Note**: Game Center only works on iOS devices and requires signing in to Game Center in iOS Settings.

## Code Structure

### Main Components

- **App.tsx**: Main application component with full Game Center integration
- **Game State Management**: React hooks for managing authentication and game state
- **Error Handling**: Comprehensive error handling with user-friendly messages

### Key Functions

#### Initialization
```typescript
const initializeGameCenter = async () => {
  const isAvailable = await ExpoGameCenter.isGameCenterAvailable();
  if (isAvailable) {
    await authenticatePlayer();
  }
};
```

#### Authentication
```typescript
const authenticatePlayer = async () => {
  const isAuthenticated = await ExpoGameCenter.authenticateLocalPlayer();
  if (isAuthenticated) {
    const player = await ExpoGameCenter.getLocalPlayer();
    const playerImage = await ExpoGameCenter.getPlayerImage();
    // Update UI with player info
  }
};
```

#### Score Submission
```typescript
const submitScore = async () => {
  const success = await ExpoGameCenter.submitScore(score, 'your_leaderboard_id');
  // Handle success/failure
};
```

#### Achievement Reporting
```typescript
const reportAchievement = async () => {
  const success = await ExpoGameCenter.reportAchievement('your_achievement_id', 100);
  // Handle success/failure
};
```

#### Presenting Native UI
```typescript
// Show leaderboard
await ExpoGameCenter.presentLeaderboard('your_leaderboard_id');

// Show achievements
await ExpoGameCenter.presentAchievements();

// Show Game Center dashboard
await ExpoGameCenter.presentGameCenterViewController();
```

## App Store Connect Configuration

### Leaderboards
1. Go to App Store Connect → Your App → Services → Game Center
2. Click "Leaderboards" → "+" to create a new leaderboard
3. Configure:
   - **Leaderboard ID**: Use this in your code
   - **Score Format**: Integer, High to Low (or as needed)
   - **Localization**: Add display names and formats

### Achievements
1. Go to App Store Connect → Your App → Services → Game Center
2. Click "Achievements" → "+" to create a new achievement
3. Configure:
   - **Achievement ID**: Use this in your code
   - **Point Value**: 1-100 points
   - **Localization**: Add titles and descriptions

## Testing

### Development Testing
- Use iOS Simulator or physical iOS device
- Sign in to Game Center in iOS Settings
- Test all functionality in the example app

### Game Center Sandbox
- Use TestFlight for testing with sandbox Game Center
- Invite test users through App Store Connect
- Test leaderboards and achievements with multiple accounts

## Troubleshooting

### Common Issues

1. **"Game Center not available"**
   - Ensure you're running on iOS (not Android or web)
   - Check that Game Center is enabled in iOS Settings
   - Verify device supports Game Center

2. **Authentication fails**
   - Sign in to Game Center in iOS Settings
   - Check internet connection
   - Verify app bundle ID matches App Store Connect

3. **Score submission fails**
   - Verify leaderboard ID matches App Store Connect
   - Ensure leaderboard is configured and active
   - Check that player is authenticated

4. **Achievement reporting fails**
   - Verify achievement ID matches App Store Connect
   - Ensure achievement is configured and active
   - Check that player is authenticated

### Debug Tips

1. **Enable Console Logging**
   - Check console for detailed error messages
   - Module provides extensive logging for debugging

2. **Test Step by Step**
   - Test availability first
   - Then authentication
   - Then individual features

3. **Verify Configuration**
   - Double-check all IDs in App Store Connect
   - Ensure Game Center is enabled for your app

## Production Considerations

### Performance
- Cache authentication state
- Handle network errors gracefully
- Implement retry logic for network operations

### User Experience
- Provide clear feedback for all operations
- Handle authentication failures gracefully
- Offer alternative gameplay for unauthenticated users

### Privacy
- Respect user privacy preferences
- Handle Game Center permissions appropriately
- Provide clear information about data usage

## API Reference

See the main module documentation for complete API reference and additional examples.