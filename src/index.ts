/**
 * @scalekit-sdk/expo
 *
 * Official Scalekit SDK for Expo
 * Simple, secure authentication with OAuth 2.0 + PKCE
 */

// Provider and Hook
export { ScalekitProvider, useScalekit } from './ScalekitProvider';
export type { ScalekitProviderProps } from './ScalekitProvider';

// Types
export type {
  ScalekitConfig,
  ScalekitTokens,
  ScalekitUser,
  ScalekitAuthState,
  ScalekitLoginOptions,
  UseScalekitReturn,
} from './types';

// Auth Service (for advanced usage)
export { ScalekitAuth } from './services/ScalekitAuth';
