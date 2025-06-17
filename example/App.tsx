import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ExpoGameCenter, { GameCenterPlayer } from 'expo-game-center';

interface GameState {
  isAuthenticated: boolean;
  isGameCenterAvailable: boolean;
  player: GameCenterPlayer | null;
  playerImage: string | null;
  score: number;
  isLoading: boolean;
  loadingMessage: string;
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    isAuthenticated: false,
    isGameCenterAvailable: false,
    player: null,
    playerImage: null,
    score: 0,
    isLoading: false,
    loadingMessage: '',
  });

  useEffect(() => {
    initializeGameCenter();
  }, []);

  const initializeGameCenter = async () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Platform Notice', 'Game Center is only available on iOS devices.');
      return;
    }

    setGameState(prev => ({ ...prev, isLoading: true, loadingMessage: 'Checking Game Center availability...' }));

    try {
      const isAvailable = await ExpoGameCenter.isGameCenterAvailable();
      
      setGameState(prev => ({ 
        ...prev, 
        isGameCenterAvailable: isAvailable,
        loadingMessage: isAvailable ? 'Game Center is available!' : 'Game Center is not available'
      }));

      if (isAvailable) {
        await authenticatePlayer();
      }
    } catch (error) {
      console.error('Failed to initialize Game Center:', error);
      Alert.alert('Error', 'Failed to initialize Game Center');
    } finally {
      setGameState(prev => ({ ...prev, isLoading: false, loadingMessage: '' }));
    }
  };

  const authenticatePlayer = async () => {
    setGameState(prev => ({ ...prev, isLoading: true, loadingMessage: 'Authenticating with Game Center...' }));

    try {
      const isAuthenticated = await ExpoGameCenter.authenticateLocalPlayer();
      
      if (isAuthenticated) {
        const player = await ExpoGameCenter.getLocalPlayer();
        const playerImage = await ExpoGameCenter.getPlayerImage();
        
        setGameState(prev => ({
          ...prev,
          isAuthenticated: true,
          player,
          playerImage,
          loadingMessage: 'Authentication successful!',
        }));

        setTimeout(() => {
          setGameState(prev => ({ ...prev, loadingMessage: '' }));
        }, 2000);
      } else {
        Alert.alert('Authentication Failed', 'Please sign in to Game Center in Settings.');
      }
    } catch (error) {
      console.error('Authentication failed:', error);
      Alert.alert('Error', 'Failed to authenticate with Game Center');
    } finally {
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const incrementScore = () => {
    setGameState(prev => ({ ...prev, score: prev.score + 10 }));
  };

  const submitScore = async () => {
    if (!gameState.isAuthenticated) {
      Alert.alert('Not Authenticated', 'Please authenticate with Game Center first.');
      return;
    }

    setGameState(prev => ({ ...prev, isLoading: true, loadingMessage: 'Submitting score...' }));

    try {
      const success = await ExpoGameCenter.submitScore(gameState.score, 'your_leaderboard_id');
      
      if (success) {
        Alert.alert('Success', `Score ${gameState.score} submitted successfully!`);
      } else {
        Alert.alert('Failed', 'Failed to submit score. Make sure the leaderboard ID is configured.');
      }
    } catch (error) {
      console.error('Failed to submit score:', error);
      Alert.alert('Error', 'Failed to submit score');
    } finally {
      setGameState(prev => ({ ...prev, isLoading: false, loadingMessage: '' }));
    }
  };

  const reportAchievement = async () => {
    if (!gameState.isAuthenticated) {
      Alert.alert('Not Authenticated', 'Please authenticate with Game Center first.');
      return;
    }

    setGameState(prev => ({ ...prev, isLoading: true, loadingMessage: 'Reporting achievement...' }));

    try {
      const success = await ExpoGameCenter.reportAchievement('your_achievement_id', 100);
      
      if (success) {
        Alert.alert('Achievement Unlocked!', 'You have unlocked an achievement!');
      } else {
        Alert.alert('Failed', 'Failed to report achievement. Make sure the achievement ID is configured.');
      }
    } catch (error) {
      console.error('Failed to report achievement:', error);
      Alert.alert('Error', 'Failed to report achievement');
    } finally {
      setGameState(prev => ({ ...prev, isLoading: false, loadingMessage: '' }));
    }
  };

  const showLeaderboard = async () => {
    if (!gameState.isAuthenticated) {
      Alert.alert('Not Authenticated', 'Please authenticate with Game Center first.');
      return;
    }

    try {
      await ExpoGameCenter.presentLeaderboard('your_leaderboard_id');
    } catch (error) {
      console.error('Failed to show leaderboard:', error);
      Alert.alert('Error', 'Failed to show leaderboard. Make sure the leaderboard ID is configured.');
    }
  };

  const showAchievements = async () => {
    if (!gameState.isAuthenticated) {
      Alert.alert('Not Authenticated', 'Please authenticate with Game Center first.');
      return;
    }

    try {
      await ExpoGameCenter.presentAchievements();
    } catch (error) {
      console.error('Failed to show achievements:', error);
      Alert.alert('Error', 'Failed to show achievements');
    }
  };

  const showGameCenter = async () => {
    if (!gameState.isAuthenticated) {
      Alert.alert('Not Authenticated', 'Please authenticate with Game Center first.');
      return;
    }

    try {
      await ExpoGameCenter.presentGameCenterViewController();
    } catch (error) {
      console.error('Failed to show Game Center:', error);
      Alert.alert('Error', 'Failed to show Game Center');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Game Center Example</Text>
        
        {/* Loading Indicator */}
        {gameState.isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>{gameState.loadingMessage}</Text>
          </View>
        )}

        {/* Game Center Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>Status</Text>
          <Text style={styles.statusText}>
            Game Center Available: {gameState.isGameCenterAvailable ? '✅' : '❌'}
          </Text>
          <Text style={styles.statusText}>
            Authenticated: {gameState.isAuthenticated ? '✅' : '❌'}
          </Text>
        </View>

        {/* Player Information */}
        {gameState.player && (
          <View style={styles.playerContainer}>
            <Text style={styles.playerTitle}>Player Information</Text>
            {gameState.playerImage && (
              <Image 
                source={{ uri: `data:image/png;base64,${gameState.playerImage}` }}
                style={styles.playerImage}
              />
            )}
            <Text style={styles.playerText}>Display Name: {gameState.player.displayName}</Text>
            <Text style={styles.playerText}>Alias: {gameState.player.alias}</Text>
            <Text style={styles.playerText}>Player ID: {gameState.player.playerID}</Text>
          </View>
        )}

        {/* Game Controls */}
        <View style={styles.gameContainer}>
          <Text style={styles.gameTitle}>Game Score</Text>
          <Text style={styles.scoreText}>{gameState.score}</Text>
          
          <TouchableOpacity style={styles.button} onPress={incrementScore}>
            <Text style={styles.buttonText}>Add 10 Points</Text>
          </TouchableOpacity>
        </View>

        {/* Game Center Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.actionsTitle}>Game Center Actions</Text>
          
          {!gameState.isAuthenticated && (
            <TouchableOpacity style={styles.button} onPress={authenticatePlayer}>
              <Text style={styles.buttonText}>Authenticate</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.button, !gameState.isAuthenticated && styles.buttonDisabled]} 
            onPress={submitScore}
            disabled={!gameState.isAuthenticated}
          >
            <Text style={styles.buttonText}>Submit Score</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, !gameState.isAuthenticated && styles.buttonDisabled]} 
            onPress={reportAchievement}
            disabled={!gameState.isAuthenticated}
          >
            <Text style={styles.buttonText}>Report Achievement</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, !gameState.isAuthenticated && styles.buttonDisabled]} 
            onPress={showLeaderboard}
            disabled={!gameState.isAuthenticated}
          >
            <Text style={styles.buttonText}>Show Leaderboard</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, !gameState.isAuthenticated && styles.buttonDisabled]} 
            onPress={showAchievements}
            disabled={!gameState.isAuthenticated}
          >
            <Text style={styles.buttonText}>Show Achievements</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, !gameState.isAuthenticated && styles.buttonDisabled]} 
            onPress={showGameCenter}
            disabled={!gameState.isAuthenticated}
          >
            <Text style={styles.buttonText}>Show Game Center</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Instructions</Text>
          <Text style={styles.instructionsText}>
            1. Make sure you're signed in to Game Center in iOS Settings
          </Text>
          <Text style={styles.instructionsText}>
            2. Tap "Authenticate" to sign in with Game Center
          </Text>
          <Text style={styles.instructionsText}>
            3. Use "Add 10 Points" to increase your score
          </Text>
          <Text style={styles.instructionsText}>
            4. Submit scores and achievements to Game Center
          </Text>
          <Text style={styles.instructionsText}>
            5. Configure leaderboard and achievement IDs in App Store Connect
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#007AFF',
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  statusText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666',
  },
  playerContainer: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  playerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  playerImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
  },
  playerText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  gameContainer: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 20,
  },
  actionsContainer: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  instructionsText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
    lineHeight: 20,
  },
});