/**
 * @scalekit-sdk/expo - Provider Component
 *
 * React Context Provider for Scalekit authentication
 */

import React, { createContext, useEffect, useState, useCallback, useMemo } from 'react';
import { ScalekitAuth } from './services/ScalekitAuth';
import {
  ScalekitConfig,
  ScalekitAuthState,
  ScalekitLoginOptions,
  UseScalekitReturn,
} from './types';

/**
 * Scalekit Context
 */
const ScalekitContext = createContext<UseScalekitReturn | undefined>(undefined);

/**
 * Scalekit Provider Props
 */
export interface ScalekitProviderProps extends ScalekitConfig {
  children: React.ReactNode;
}

/**
 * Scalekit Provider Component
 *
 * Wrap your app with this provider to enable Scalekit authentication
 *
 * @example
 * ```tsx
 * // PKCE-only flow (recommended for mobile apps)
 * <ScalekitProvider
 *   envUrl="https://your-env.scalekit.com"
 *   clientId="your_client_id"
 * >
 *   <App />
 * </ScalekitProvider>
 *
 * // Or with client_secret for confidential clients
 * <ScalekitProvider
 *   envUrl="https://your-env.scalekit.com"
 *   clientId="your_client_id"
 *   clientSecret="your_client_secret"
 * >
 *   <App />
 * </ScalekitProvider>
 * ```
 */
export const ScalekitProvider: React.FC<ScalekitProviderProps> = ({
  children,
  envUrl,
  clientId,
  clientSecret,
  redirectUri,
  scopes,
}) => {
  // Initialize auth service
  const authService = useMemo(
    () =>
      new ScalekitAuth({
        envUrl,
        clientId,
        clientSecret,
        redirectUri,
        scopes,
      }),
    [envUrl, clientId, clientSecret, redirectUri, scopes]
  );

  // Auth state
  const [authState, setAuthState] = useState<ScalekitAuthState>({
    isLoading: true,
    isAuthenticated: false,
    user: null,
    tokens: null,
    error: null,
  });

  /**
   * Initialize auth state from stored credentials
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedTokens = await authService.getStoredTokens();
        const storedUser = await authService.getStoredUserInfo();

        if (storedTokens && storedUser && !authService.areTokensExpired(storedTokens)) {
          // Valid session exists
          setAuthState({
            isLoading: false,
            isAuthenticated: true,
            user: storedUser,
            tokens: storedTokens,
            error: null,
          });
        } else {
          // No valid session
          if (storedTokens) {
            // Clean up expired tokens
            await authService.logout();
          }
          setAuthState({
            isLoading: false,
            isAuthenticated: false,
            user: null,
            tokens: null,
            error: null,
          });
        }
      } catch (error) {
        console.error('[Scalekit] Error initializing auth:', error);
        setAuthState({
          isLoading: false,
          isAuthenticated: false,
          user: null,
          tokens: null,
          error: 'Failed to initialize authentication',
        });
      }
    };

    initAuth();
  }, [authService]);

  /**
   * Handle login flow
   */
  const login = useCallback(
    async (options?: ScalekitLoginOptions) => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

        // Start OAuth flow with PKCE
        const result = await authService.login(options);

        if (result.type === 'success' && result.url) {
          // Parse the URL to extract the authorization code
          const url = new URL(result.url);
          const code = url.searchParams.get('code');

          if (!code) {
            throw new Error('No authorization code received');
          }

          // Exchange authorization code for tokens
          const tokens = await authService.exchangeCodeForTokens(code);

          // Get user information from id_token
          if (!tokens.idToken) {
            throw new Error('No id_token received from Scalekit');
          }
          const user = await authService.getUserInfo(tokens.idToken);

          // Update state
          setAuthState({
            isLoading: false,
            isAuthenticated: true,
            user,
            tokens,
            error: null,
          });
        } else if (result.type === 'dismiss' || result.type === 'cancel') {
          // User cancelled
          setAuthState((prev) => ({
            ...prev,
            isLoading: false,
            error: null,
          }));
        } else {
          throw new Error('Authentication was not successful');
        }
      } catch (error) {
        console.error('[Scalekit] Login error:', error);
        setAuthState({
          isLoading: false,
          isAuthenticated: false,
          user: null,
          tokens: null,
          error: error instanceof Error ? error.message : 'Login failed',
        });
      }
    },
    [authService]
  );

  /**
   * Handle logout
   */
  const logout = useCallback(async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));
      await authService.logout();
      setAuthState({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        tokens: null,
        error: null,
      });
    } catch (error) {
      console.error('[Scalekit] Logout error:', error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to logout',
      }));
    }
  }, [authService]);

  /**
   * Refresh user information
   */
  const refreshUser = useCallback(async () => {
    if (!authState.tokens || !authState.tokens.idToken) {
      throw new Error('No active session');
    }

    try {
      const user = await authService.getUserInfo(authState.tokens.idToken);
      setAuthState((prev) => ({ ...prev, user }));
    } catch (error) {
      console.error('[Scalekit] Error refreshing user info:', error);
      throw error;
    }
  }, [authService, authState.tokens]);

  /**
   * Get current access token
   */
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const tokens = await authService.getStoredTokens();
    if (!tokens || authService.areTokensExpired(tokens)) {
      return null;
    }
    return tokens.accessToken;
  }, [authService]);

  // Context value
  const value: UseScalekitReturn = {
    ...authState,
    login,
    logout,
    refreshUser,
    getAccessToken,
  };

  return <ScalekitContext.Provider value={value}>{children}</ScalekitContext.Provider>;
};

/**
 * Hook to use Scalekit authentication
 *
 * @example
 * ```tsx
 * const { login, logout, user, isAuthenticated } = useScalekit();
 *
 * if (isAuthenticated) {
 *   return <Text>Hello {user?.name}</Text>;
 * }
 *
 * return <Button onPress={login}>Login</Button>;
 * ```
 */
export const useScalekit = (): UseScalekitReturn => {
  const context = React.useContext(ScalekitContext);
  if (!context) {
    throw new Error('useScalekit must be used within a ScalekitProvider');
  }
  return context;
};
