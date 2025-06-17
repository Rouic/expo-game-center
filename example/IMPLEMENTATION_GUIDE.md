# Implementation Guide

This guide shows how to integrate `expo-game-center` into your existing Expo/React Native app.

## Quick Start (5 minutes)

### 1. Installation
```bash
npm install expo-game-center
```

### 2. Basic Setup
```typescript
import ExpoGameCenter from 'expo-game-center';
import { Platform } from 'react-native';

// Check if Game Center is available (iOS only)
const checkGameCenter = async () => {
  if (Platform.OS !== 'ios') return false;
  return await ExpoGameCenter.isGameCenterAvailable();
};

// Authenticate player
const signIn = async () => {
  try {
    const isAuthenticated = await ExpoGameCenter.authenticateLocalPlayer();
    if (isAuthenticated) {
      const player = await ExpoGameCenter.getLocalPlayer();
      console.log('Signed in as:', player?.displayName);
      return true;
    }
  } catch (error) {
    console.error('Sign in failed:', error);
  }
  return false;
};
```

### 3. Submit Scores
```typescript
const submitHighScore = async (score: number) => {
  try {
    const success = await ExpoGameCenter.submitScore(score, 'your_leaderboard_id');
    if (success) {
      console.log('Score submitted successfully!');
    }
  } catch (error) {
    console.error('Score submission failed:', error);
  }
};
```

### 4. Report Achievements
```typescript
const unlockAchievement = async () => {
  try {
    const success = await ExpoGameCenter.reportAchievement('your_achievement_id', 100);
    if (success) {
      console.log('Achievement unlocked!');
    }
  } catch (error) {
    console.error('Achievement failed:', error);
  }
};
```

### 5. Show Game Center UI
```typescript
// Show leaderboard
const showLeaderboard = () => {
  ExpoGameCenter.presentLeaderboard('your_leaderboard_id');
};

// Show achievements
const showAchievements = () => {
  ExpoGameCenter.presentAchievements();
};

// Show Game Center dashboard
const showGameCenter = () => {
  ExpoGameCenter.presentGameCenterViewController();
};
```

## React Hook Pattern

Create a custom hook for Game Center functionality:

```typescript
import { useState, useEffect } from 'react';
import ExpoGameCenter, { GameCenterPlayer } from 'expo-game-center';
import { Platform } from 'react-native';

export const useGameCenter = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [player, setPlayer] = useState<GameCenterPlayer | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeGameCenter();
  }, []);

  const initializeGameCenter = async () => {
    if (Platform.OS !== 'ios') return;
    
    setLoading(true);
    try {
      const available = await ExpoGameCenter.isGameCenterAvailable();
      setIsAvailable(available);
      
      if (available) {
        await authenticate();
      }
    } catch (error) {
      console.error('GameCenter initialization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const authenticate = async () => {
    try {
      const authenticated = await ExpoGameCenter.authenticateLocalPlayer();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const playerData = await ExpoGameCenter.getLocalPlayer();
        setPlayer(playerData);
      }
      
      return authenticated;
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    }
  };

  const submitScore = async (score: number, leaderboardId: string) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    return ExpoGameCenter.submitScore(score, leaderboardId);
  };

  const reportAchievement = async (achievementId: string, progress: number) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    return ExpoGameCenter.reportAchievement(achievementId, progress);
  };

  return {
    isAvailable,
    isAuthenticated,
    player,
    loading,
    authenticate,
    submitScore,
    reportAchievement,
    showLeaderboard: (id: string) => ExpoGameCenter.presentLeaderboard(id),
    showAchievements: () => ExpoGameCenter.presentAchievements(),
    showGameCenter: () => ExpoGameCenter.presentGameCenterViewController(),
  };
};
```

## Usage in Components

```typescript
import React from 'react';
import { View, Button, Text, Alert } from 'react-native';
import { useGameCenter } from './hooks/useGameCenter';

export const GameScreen = () => {
  const {
    isAvailable,
    isAuthenticated,
    player,
    loading,
    authenticate,
    submitScore,
    showLeaderboard,
  } = useGameCenter();

  const handleSubmitScore = async () => {
    try {
      await submitScore(1000, 'your_leaderboard_id');
      Alert.alert('Success', 'Score submitted!');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit score');
    }
  };

  if (loading) {
    return <Text>Loading Game Center...</Text>;
  }

  if (!isAvailable) {
    return <Text>Game Center not available</Text>;
  }

  return (
    <View>
      {isAuthenticated ? (
        <View>
          <Text>Welcome, {player?.displayName}!</Text>
          <Button title="Submit Score" onPress={handleSubmitScore} />
          <Button title="Show Leaderboard" onPress={() => showLeaderboard('your_leaderboard_id')} />
        </View>
      ) : (
        <Button title="Sign in to Game Center" onPress={authenticate} />
      )}
    </View>
  );
};
```

## Configuration Requirements

### app.json / app.config.js
```json
{
  "expo": {
    "plugins": [
      ["expo-game-center", {}]
    ],
    "ios": {
      "bundleIdentifier": "com.yourcompany.yourapp"
    }
  }
}
```

### App Store Connect
1. Create your app in App Store Connect
2. Go to Services → Game Center
3. Configure leaderboards and achievements
4. Note the IDs for use in your code

## Best Practices

### Error Handling
```typescript
const safeGameCenterCall = async (operation: () => Promise<any>) => {
  try {
    return await operation();
  } catch (error) {
    console.error('Game Center operation failed:', error);
    // Show user-friendly error message
    // Maybe fall back to local storage
    return null;
  }
};
```

### Graceful Degradation
```typescript
const submitScoreWithFallback = async (score: number, leaderboardId: string) => {
  if (isAuthenticated) {
    try {
      await ExpoGameCenter.submitScore(score, leaderboardId);
      return true;
    } catch (error) {
      console.error('Game Center submission failed:', error);
    }
  }
  
  // Fall back to local high score tracking
  saveLocalHighScore(score);
  return false;
};
```

### User Privacy
```typescript
const requestGameCenterPermission = async () => {
  Alert.alert(
    'Game Center',
    'Connect to Game Center to compare scores with friends and unlock achievements?',
    [
      { text: 'Not Now', style: 'cancel' },
      { text: 'Connect', onPress: authenticate },
    ]
  );
};
```

This implementation guide should help developers quickly integrate Game Center into their apps!