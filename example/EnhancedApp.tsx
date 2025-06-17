import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useGameCenter } from 'expo-game-center';

// Example configuration with leaderboard and achievement mappings
const gameCenterConfig = {
  leaderboards: {
    'high_scores': 'your_high_scores_leaderboard_id',
    'weekly_scores': 'your_weekly_leaderboard_id',
  },
  achievements: {
    'first_win': 'your_first_win_achievement_id',
    'high_scorer': 'your_high_scorer_achievement_id',
    'dedicated_player': 'your_dedicated_player_achievement_id',
  },
  enableLogging: true,
};

export default function EnhancedApp() {
  const {
    // Status
    status,
    isReady,
    isLoading,
    error,
    
    // Player info
    player,
    
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
    isPlatformSupported,
  } = useGameCenter({
    ...gameCenterConfig,
    autoInitialize: true,
    autoAuthenticate: false, // Let user choose when to authenticate
  });

  const [score, setScore] = React.useState(0);

  // Handle status changes
  useEffect(() => {
    console.log('GameCenter status changed:', status);
  }, [status]);

  const handleAuthenticate = async () => {
    const success = await authenticate();
    if (success) {
      Alert.alert('Success', 'Successfully authenticated with GameCenter!');
    } else {
      Alert.alert('Authentication Failed', 'Please check your GameCenter settings.');
    }
  };

  const handleSubmitScore = async () => {
    const success = await submitScore(score, 'high_scores');
    if (success) {
      Alert.alert('Success', `Score ${score} submitted to leaderboard!`);
    } else {
      Alert.alert('Failed', 'Could not submit score. Check your configuration.');
    }
  };

  const handleReportAchievement = async (achievementKey: string, progress: number = 100) => {
    const success = await reportAchievement(achievementKey, progress);
    if (success) {
      Alert.alert('Achievement!', `Progress reported: ${progress}%`);
    } else {
      Alert.alert('Failed', 'Could not report achievement. Check your configuration.');
    }
  };

  const incrementScore = () => {
    setScore(prev => prev + 10);
  };

  if (!isPlatformSupported) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>GameCenter is only available on iOS</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Enhanced GameCenter Example</Text>
        
        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}

        {/* Status Section */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>Connection Status</Text>
          <Text style={styles.statusText}>State: {status.state}</Text>
          <Text style={styles.statusText}>Description: {getStateDescription()}</Text>
          <Text style={styles.statusText}>Available: {status.isAvailable ? '✅' : '❌'}</Text>
          <Text style={styles.statusText}>Authenticated: {status.isAuthenticated ? '✅' : '❌'}</Text>
          <Text style={styles.statusText}>Ready: {isReady ? '✅' : '❌'}</Text>
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {error}</Text>
            </View>
          )}
        </View>

        {/* Player Information */}
        {player && (
          <View style={styles.playerContainer}>
            <Text style={styles.playerTitle}>Player Information</Text>
            <Text style={styles.playerText}>Display Name: {player.displayName}</Text>
            <Text style={styles.playerText}>Alias: {player.alias}</Text>
            <Text style={styles.playerText}>Player ID: {player.playerID}</Text>
          </View>
        )}

        {/* Game Section */}
        <View style={styles.gameContainer}>
          <Text style={styles.gameTitle}>Game Score</Text>
          <Text style={styles.scoreText}>{score}</Text>
          
          <TouchableOpacity style={styles.button} onPress={incrementScore}>
            <Text style={styles.buttonText}>Add 10 Points</Text>
          </TouchableOpacity>
        </View>

        {/* Actions Section */}
        <View style={styles.actionsContainer}>
          <Text style={styles.actionsTitle}>GameCenter Actions</Text>
          
          <TouchableOpacity style={styles.button} onPress={initialize}>
            <Text style={styles.buttonText}>Reinitialize</Text>
          </TouchableOpacity>

          {!status.isAuthenticated && (
            <TouchableOpacity style={styles.button} onPress={handleAuthenticate}>
              <Text style={styles.buttonText}>Authenticate</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.button, !isReady && styles.buttonDisabled]} 
            onPress={handleSubmitScore}
            disabled={!isReady}
          >
            <Text style={styles.buttonText}>Submit Score</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, !isReady && styles.buttonDisabled]} 
            onPress={() => handleReportAchievement('first_win')}
            disabled={!isReady}
          >
            <Text style={styles.buttonText}>Report Achievement (100%)</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, !isReady && styles.buttonDisabled]} 
            onPress={() => handleReportAchievement('dedicated_player', 50)}
            disabled={!isReady}
          >
            <Text style={styles.buttonText}>Report Achievement (50%)</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, !isReady && styles.buttonDisabled]} 
            onPress={() => showLeaderboard('high_scores')}
            disabled={!isReady}
          >
            <Text style={styles.buttonText}>Show High Scores</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, !isReady && styles.buttonDisabled]} 
            onPress={() => showLeaderboard('weekly_scores')}
            disabled={!isReady}
          >
            <Text style={styles.buttonText}>Show Weekly Scores</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, !isReady && styles.buttonDisabled]} 
            onPress={showAchievements}
            disabled={!isReady}
          >
            <Text style={styles.buttonText}>Show Achievements</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, !isReady && styles.buttonDisabled]} 
            onPress={showGameCenter}
            disabled={!isReady}
          >
            <Text style={styles.buttonText}>Show GameCenter</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.resetButton]} 
            onPress={reset}
          >
            <Text style={styles.buttonText}>Reset Connection</Text>
          </TouchableOpacity>
        </View>

        {/* Configuration Info */}
        <View style={styles.configContainer}>
          <Text style={styles.configTitle}>Configuration</Text>
          <Text style={styles.configText}>
            This example uses configured leaderboard and achievement IDs.
          </Text>
          <Text style={styles.configText}>
            Update the configuration object with your actual IDs from App Store Connect.
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
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 4,
    marginTop: 10,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
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
  },
  playerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
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
  resetButton: {
    backgroundColor: '#ff6b6b',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  configContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  configTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  configText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
    lineHeight: 20,
  },
});