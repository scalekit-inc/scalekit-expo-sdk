/**
 * @scalekit-sdk/expo - Type Definitions
 */

/**
 * Scalekit SDK Configuration
 */
export interface ScalekitConfig {
  /** Your Scalekit Environment URL (e.g., https://your-env.scalekit.com) */
  envUrl: string;
  /** Your Scalekit Client ID */
  clientId: string;
  /**
   * Your Scalekit Client Secret (optional)
   * Not required when using PKCE-only flow. Only include for confidential clients.
   */
  clientSecret?: string;
  /** OAuth redirect URI (must match Scalekit dashboard configuration) */
  redirectUri?: string;
  /** OAuth scopes to request (default: ['openid', 'profile', 'email']) */
  scopes?: string[];
}

/**
 * OAuth tokens returned from Scalekit
 */
export interface ScalekitTokens {
  /** Access token for API calls */
  accessToken: string;
  /** Refresh token for obtaining new access tokens */
  refreshToken?: string;
  /** ID token containing user claims (JWT) */
  idToken?: string;
  /** Token type (usually "Bearer") */
  tokenType: string;
  /** Number of seconds until token expires */
  expiresIn: number;
  /** Timestamp (ms) when token expires */
  expiresAt: number;
}

/**
 * User information from ID token
 */
export interface ScalekitUser {
  /** Unique user identifier (subject) */
  sub: string;
  /** User's email address */
  email?: string;
  /** Whether email is verified */
  emailVerified?: boolean;
  /** User's full name */
  name?: string;
  /** User's given name (first name) */
  givenName?: string;
  /** User's family name (last name) */
  familyName?: string;
  /** URL to user's profile picture */
  picture?: string;
  /** Custom claims from ID token */
  [key: string]: any;
}

/**
 * Authentication state
 */
export interface ScalekitAuthState {
  /** Whether auth state is being initialized or login is in progress */
  isLoading: boolean;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Current user information (null if not authenticated) */
  user: ScalekitUser | null;
  /** Current tokens (null if not authenticated) */
  tokens: ScalekitTokens | null;
  /** Error message if authentication failed */
  error: string | null;
}

/**
 * Options for login method
 */
export interface ScalekitLoginOptions {
  /** Organization ID for B2B/multi-tenant apps */
  organizationId?: string;
  /** Connection ID for specific SSO connection */
  connectionId?: string;
  /** Additional OAuth parameters */
  extraParams?: Record<string, string>;
}

/**
 * Scalekit hook return type
 */
export interface UseScalekitReturn extends ScalekitAuthState {
  /**
   * Initiate login flow - opens browser for authentication
   * @param options Optional login parameters
   */
  login: (options?: ScalekitLoginOptions) => Promise<void>;

  /**
   * Logout current user and clear session
   */
  logout: () => Promise<void>;

  /**
   * Refresh user information from stored ID token
   */
  refreshUser: () => Promise<void>;

  /**
   * Get current access token (useful for API calls)
   */
  getAccessToken: () => Promise<string | null>;
}
