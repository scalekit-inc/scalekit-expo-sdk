/**
 * @scalekit-sdk/expo - Core Authentication Service
 *
 * Handles OAuth 2.0 with PKCE flow, token management, and secure storage
 */

import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import {
  ScalekitConfig,
  ScalekitTokens,
  ScalekitUser,
  ScalekitLoginOptions,
} from '../types';

// Configure WebBrowser for OAuth
WebBrowser.maybeCompleteAuthSession();

// Storage keys
const STORAGE_KEYS = {
  TOKENS: 'scalekit_tokens',
  USER_INFO: 'scalekit_user_info',
  CODE_VERIFIER: 'pkce_code_verifier',
} as const;

/**
 * ScalekitAuth Service Class
 */
export class ScalekitAuth {
  private config: ScalekitConfig;

  constructor(config: ScalekitConfig) {
    this.config = {
      ...config,
      scopes: config.scopes || ['openid', 'profile', 'email'],
      redirectUri: config.redirectUri || this.getDefaultRedirectUri(),
    };
  }

  /**
   * Get default redirect URI based on environment
   */
  private getDefaultRedirectUri(): string {
    // In development, use exp:// scheme
    // In production, use custom scheme from app.json
    return 'exp://localhost:8081/--/auth/callback';
  }

  /**
   * Get OAuth endpoints
   */
  private getEndpoints() {
    return {
      authorization: `${this.config.envUrl}/oauth/authorize`,
      token: `${this.config.envUrl}/oauth/token`,
    };
  }

  /**
   * Generate a cryptographically secure random string for PKCE
   */
  private async generateCodeVerifier(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    return this.base64URLEncode(randomBytes);
  }

  /**
   * Generate code challenge from code verifier using SHA256
   */
  private async generateCodeChallenge(verifier: string): Promise<string> {
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      verifier
    );
    return this.base64URLEncode(this.hexToBytes(digest));
  }

  /**
   * Convert hex string to byte array
   */
  private hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }

  /**
   * Base64 URL encode (RFC 4648)
   */
  private base64URLEncode(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Initiate OAuth login with PKCE
   */
  async login(options?: ScalekitLoginOptions): Promise<WebBrowser.WebBrowserAuthSessionResult> {
    try {
      // Generate PKCE parameters
      const codeVerifier = await this.generateCodeVerifier();
      const codeChallenge = await this.generateCodeChallenge(codeVerifier);

      // Store code verifier for later use in token exchange
      await SecureStore.setItemAsync(STORAGE_KEYS.CODE_VERIFIER, codeVerifier);

      // Build authorization URL
      const params: Record<string, string> = {
        client_id: this.config.clientId,
        redirect_uri: this.config.redirectUri!,
        response_type: 'code',
        scope: this.config.scopes!.join(' '),
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      };

      // Add optional parameters
      if (options?.organizationId) {
        params.organization_id = options.organizationId;
      }
      if (options?.connectionId) {
        params.connection_id = options.connectionId;
      }
      if (options?.extraParams) {
        Object.assign(params, options.extraParams);
      }

      const urlParams = new URLSearchParams(params);
      const authUrl = `${this.getEndpoints().authorization}?${urlParams.toString()}`;

      // Start auth session using WebBrowser
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        this.config.redirectUri!
      );

      return result;
    } catch (error) {
      console.error('[Scalekit] Error initiating login:', error);
      throw error;
    }
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<ScalekitTokens> {
    try {
      // Retrieve stored code verifier
      const codeVerifier = await SecureStore.getItemAsync(STORAGE_KEYS.CODE_VERIFIER);
      if (!codeVerifier) {
        throw new Error('Code verifier not found. Please restart the login flow.');
      }

      // Exchange code for tokens
      const response = await fetch(this.getEndpoints().token, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.config.redirectUri!,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code_verifier: codeVerifier,
        }).toString(),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Token exchange failed: ${errorData}`);
      }

      const data = await response.json() as any;

      const tokens: ScalekitTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        idToken: data.id_token,
        tokenType: data.token_type,
        expiresIn: data.expires_in,
        expiresAt: Date.now() + data.expires_in * 1000,
      };

      // Store tokens securely
      await SecureStore.setItemAsync(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));

      // Clean up code verifier
      await SecureStore.deleteItemAsync(STORAGE_KEYS.CODE_VERIFIER);

      return tokens;
    } catch (error) {
      console.error('[Scalekit] Error exchanging code for tokens:', error);
      throw error;
    }
  }

  /**
   * Decode JWT id_token to get user information
   */
  private decodeIdToken(idToken: string): ScalekitUser {
    try {
      // JWT has three parts: header.payload.signature
      const parts = idToken.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      // Decode the payload (second part)
      const payload = parts[1];
      // Add padding if needed
      const paddedPayload = payload + '='.repeat((4 - (payload.length % 4)) % 4);
      // Decode from base64
      const decodedPayload = atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/'));
      const userInfo = JSON.parse(decodedPayload);

      return userInfo;
    } catch (error) {
      console.error('[Scalekit] Error decoding id_token:', error);
      throw new Error('Failed to decode user information from id_token');
    }
  }

  /**
   * Get user information from id_token
   */
  async getUserInfo(idToken: string): Promise<ScalekitUser> {
    try {
      // Decode the id_token JWT to extract user information
      const userInfo = this.decodeIdToken(idToken);

      // Store user info
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));

      return userInfo;
    } catch (error) {
      console.error('[Scalekit] Error getting user info:', error);
      throw error;
    }
  }

  /**
   * Get stored tokens from secure storage
   */
  async getStoredTokens(): Promise<ScalekitTokens | null> {
    try {
      const tokensJson = await SecureStore.getItemAsync(STORAGE_KEYS.TOKENS);
      return tokensJson ? JSON.parse(tokensJson) : null;
    } catch (error) {
      console.error('[Scalekit] Error retrieving stored tokens:', error);
      return null;
    }
  }

  /**
   * Get stored user info from secure storage
   */
  async getStoredUserInfo(): Promise<ScalekitUser | null> {
    try {
      const userInfoJson = await SecureStore.getItemAsync(STORAGE_KEYS.USER_INFO);
      return userInfoJson ? JSON.parse(userInfoJson) : null;
    } catch (error) {
      console.error('[Scalekit] Error retrieving stored user info:', error);
      return null;
    }
  }

  /**
   * Check if tokens are expired
   */
  areTokensExpired(tokens: ScalekitTokens): boolean {
    // Add 60 second buffer to handle clock skew
    return Date.now() >= tokens.expiresAt - 60000;
  }

  /**
   * Logout and clear all stored data
   */
  async logout(): Promise<void> {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.TOKENS),
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER_INFO),
        SecureStore.deleteItemAsync(STORAGE_KEYS.CODE_VERIFIER),
      ]);
    } catch (error) {
      console.error('[Scalekit] Error during logout:', error);
      throw error;
    }
  }
}
