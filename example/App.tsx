/**
 * Example App using @scalekit-sdk/expo
 *
 * This demonstrates how simple it is to add Scalekit authentication
 * to your Expo app using the SDK.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { ScalekitProvider, useScalekit } from '@scalekit-sdk/expo';

/**
 * Main App Screen - Shows login/logout based on auth state
 */
function AppScreen() {
  const { login, logout, user, isAuthenticated, isLoading, error } = useScalekit();

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Authenticated state - show user info
  if (isAuthenticated && user) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome!</Text>
          <Text style={styles.subtitle}>You're logged in</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>User Information</Text>

            {user.name && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Name:</Text>
                <Text style={styles.value}>{user.name}</Text>
              </View>
            )}

            {user.email && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{user.email}</Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.label}>User ID:</Text>
              <Text style={styles.value}>{user.sub}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // Unauthenticated state - show login button
  return (
    <View style={styles.centerContainer}>
      <View style={styles.content}>
        <Text style={styles.title}>Scalekit Auth</Text>
        <Text style={styles.subtitle}>Secure authentication for your Expo app</Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.loginButton} onPress={() => login()}>
          <Text style={styles.buttonText}>Login with Scalekit</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          This will open Scalekit's secure login page
        </Text>
      </View>
    </View>
  );
}

/**
 * Root App Component
 *
 * Wrap your app with ScalekitProvider to enable authentication
 */
export default function App() {
  return (
    <ScalekitProvider
      envUrl={process.env.EXPO_PUBLIC_SCALEKIT_ENV_URL || 'https://your-env.scalekit.com'}
      clientId={process.env.EXPO_PUBLIC_SCALEKIT_CLIENT_ID || 'your_client_id'}
      clientSecret={process.env.EXPO_PUBLIC_SCALEKIT_CLIENT_SECRET || 'your_client_secret'}
    >
      <AppScreen />
    </ScalekitProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 48,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#fee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#c00',
    fontSize: 14,
    textAlign: 'center',
  },
});
