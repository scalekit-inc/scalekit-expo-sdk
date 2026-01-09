# @scalekit-sdk/expo

Official Scalekit SDK for Expo - Add enterprise-ready authentication to your React Native mobile app in minutes.

[![npm version](https://img.shields.io/npm/v/@scalekit-sdk/expo.svg)](https://www.npmjs.com/package/@scalekit-sdk/expo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- 🔐 **OAuth 2.0 with PKCE** - Secure authentication flow for mobile apps
- 🚀 **3 Lines of Code** - Simple, intuitive API
- 🔄 **Auto Session Management** - Persistent auth across app restarts
- 🏢 **Enterprise SSO** - SAML, OIDC, and social logins
- 🎯 **TypeScript** - Full type safety out of the box
- 📱 **React Hooks** - Modern React patterns
- 🔒 **Secure Storage** - Tokens stored in device keychain
- ⚡ **Zero Config** - Automatic deep linking setup

## 📦 Installation

```bash
npm install @scalekit-sdk/expo
```

or

```bash
yarn add @scalekit-sdk/expo
```

### Peer Dependencies

This SDK requires the following Expo packages (usually already installed in Expo projects):

```bash
npx expo install expo-crypto expo-secure-store expo-web-browser
```

## 🚀 Quick Start

### 1. Get Your Scalekit Credentials

1. Sign up at [Scalekit Dashboard](https://app.scalekit.com)
2. Create an application
3. Note your **Environment URL** and **Client ID**
4. Add redirect URI: `your-app-scheme://auth/callback`

> **Note:** Client Secret is optional when using PKCE-only flow (recommended for mobile apps)

### 2. Configure Your App

Add the Scalekit plugin to your `app.json`:

```json
{
  "expo": {
    "name": "My App",
    "scheme": "myapp",
    "plugins": [
      "@scalekit-sdk/expo"
    ]
  }
}
```

### 3. Wrap Your App with ScalekitProvider

```tsx
import { ScalekitProvider } from '@scalekit-sdk/expo';

export default function App() {
  return (
    <ScalekitProvider
      envUrl="https://your-env.scalekit.com"
      clientId="your_client_id"
      // clientSecret="your_client_secret" // Optional - not required for PKCE-only flow
    >
      <YourApp />
    </ScalekitProvider>
  );
}
```

### 4. Use the `useScalekit` Hook

```tsx
import { useScalekit } from '@scalekit-sdk/expo';
import { View, Button, Text } from 'react-native';

function LoginScreen() {
  const { login, logout, user, isAuthenticated, isLoading } = useScalekit();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (isAuthenticated) {
    return (
      <View>
        <Text>Welcome, {user?.name}!</Text>
        <Button title="Logout" onPress={logout} />
      </View>
    );
  }

  return <Button title="Login with Scalekit" onPress={login} />;
}
```

That's it! 🎉 Authentication is now fully integrated.

## 📚 API Reference

### `<ScalekitProvider>`

Wrap your app with this provider to enable Scalekit authentication.

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `envUrl` | `string` | ✅ | Your Scalekit environment URL |
| `clientId` | `string` | ✅ | Your Scalekit client ID |
| `clientSecret` | `string` | ❌ | Your Scalekit client secret (optional for PKCE-only flow) |
| `redirectUri` | `string` | ❌ | Custom redirect URI (default: uses app scheme) |
| `scopes` | `string[]` | ❌ | OAuth scopes (default: `['openid', 'profile', 'email']`) |
| `children` | `ReactNode` | ✅ | Your app components |

#### Example

```tsx
// PKCE-only flow (recommended for mobile apps)
<ScalekitProvider
  envUrl={process.env.EXPO_PUBLIC_SCALEKIT_ENV_URL}
  clientId={process.env.EXPO_PUBLIC_SCALEKIT_CLIENT_ID}
  scopes={['openid', 'profile', 'email', 'organizations']}
>
  <App />
</ScalekitProvider>

// Or with client_secret for additional security (if required by your setup)
<ScalekitProvider
  envUrl={process.env.EXPO_PUBLIC_SCALEKIT_ENV_URL}
  clientId={process.env.EXPO_PUBLIC_SCALEKIT_CLIENT_ID}
  clientSecret={process.env.EXPO_PUBLIC_SCALEKIT_CLIENT_SECRET}
  scopes={['openid', 'profile', 'email', 'organizations']}
>
  <App />
</ScalekitProvider>
```

### `useScalekit()`

Hook to access authentication state and methods.

#### Returns

```typescript
{
  // Auth State
  isLoading: boolean;
  isAuthenticated: boolean;
  user: ScalekitUser | null;
  tokens: ScalekitTokens | null;
  error: string | null;

  // Methods
  login: (options?: ScalekitLoginOptions) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}
```

#### Example

```tsx
const {
  login,
  logout,
  user,
  isAuthenticated,
  isLoading,
  error
} = useScalekit();
```

### `login(options?)`

Initiates the OAuth login flow. Opens a browser for user authentication.

#### Parameters

```typescript
interface ScalekitLoginOptions {
  organizationId?: string;     // For B2B/multi-tenant apps
  connectionId?: string;        // Specific SSO connection
  extraParams?: Record<string, string>;  // Additional OAuth params
}
```

#### Examples

```tsx
// Basic login
await login();

// Login with organization (B2B/Multi-tenant)
await login({ organizationId: 'org_123' });

// Login with specific SSO connection
await login({ connectionId: 'conn_456' });
```

### `logout()`

Logs out the current user and clears all stored session data.

```tsx
await logout();
```

### `refreshUser()`

Refreshes user information from the stored ID token.

```tsx
await refreshUser();
```

### `getAccessToken()`

Returns the current access token (useful for API calls).

```tsx
const token = await getAccessToken();
if (token) {
  // Make API call with token
  fetch('https://api.example.com/data', {
    headers: { Authorization: `Bearer ${token}` }
  });
}
```

## 🎯 Advanced Usage

### Environment Variables

Store credentials securely using environment variables:

```env
EXPO_PUBLIC_SCALEKIT_ENV_URL=https://your-env.scalekit.com
EXPO_PUBLIC_SCALEKIT_CLIENT_ID=your_client_id
EXPO_PUBLIC_SCALEKIT_CLIENT_SECRET=your_client_secret
```

```tsx
<ScalekitProvider
  envUrl={process.env.EXPO_PUBLIC_SCALEKIT_ENV_URL!}
  clientId={process.env.EXPO_PUBLIC_SCALEKIT_CLIENT_ID!}
  clientSecret={process.env.EXPO_PUBLIC_SCALEKIT_CLIENT_SECRET!}
>
  <App />
</ScalekitProvider>
```

### Protected Routes

Create an auth guard component:

```tsx
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useScalekit();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <>{children}</>;
}

// Usage
<ProtectedRoute>
  <HomeScreen />
</ProtectedRoute>
```

### Multi-Tenant / B2B Applications

```tsx
function OrganizationPicker() {
  const { login } = useScalekit();
  const [selectedOrg, setSelectedOrg] = useState('');

  const handleLogin = () => {
    login({ organizationId: selectedOrg });
  };

  return (
    <View>
      <Picker
        selectedValue={selectedOrg}
        onValueChange={setSelectedOrg}
      >
        <Picker.Item label="Acme Corp" value="org_acme" />
        <Picker.Item label="Wayne Enterprises" value="org_wayne" />
      </Picker>
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}
```

### Making Authenticated API Calls

```tsx
function DataFetcher() {
  const { getAccessToken } = useScalekit();
  const [data, setData] = useState(null);

  const fetchData = async () => {
    const token = await getAccessToken();
    if (!token) {
      console.error('No access token available');
      return;
    }

    const response = await fetch('https://api.example.com/user/data', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    setData(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return <View>{/* Render data */}</View>;
}
```

### Custom Redirect URI

```tsx
<ScalekitProvider
  envUrl="https://your-env.scalekit.com"
  clientId="your_client_id"
  clientSecret="your_client_secret"
  redirectUri="myapp://auth/callback"
>
  <App />
</ScalekitProvider>
```

**Important:** Make sure the redirect URI matches what's configured in your Scalekit dashboard.

## 🏗️ TypeScript Support

The SDK is written in TypeScript and provides complete type definitions.

```typescript
import {
  ScalekitUser,
  ScalekitTokens,
  ScalekitAuthState,
  ScalekitLoginOptions
} from '@scalekit-sdk/expo';

const handleLogin = async (options: ScalekitLoginOptions) => {
  await login(options);
};

const renderUser = (user: ScalekitUser | null) => {
  if (!user) return null;
  return <Text>{user.name}</Text>;
};
```

## 🔧 Configuration

### Custom URL Scheme

By default, the SDK uses your app's `scheme` from `app.json`. To customize:

```json
{
  "expo": {
    "scheme": "myapp",
    "plugins": [
      ["@scalekit-sdk/expo", { "scheme": "customscheme" }]
    ]
  }
}
```

### OAuth Scopes

```tsx
<ScalekitProvider
  // ... other props
  scopes={['openid', 'profile', 'email', 'organizations', 'offline_access']}
>
  <App />
</ScalekitProvider>
```

## 🐛 Troubleshooting

### "No redirect URI configured" Error

Make sure your redirect URI in the Scalekit dashboard matches your app's scheme:
- Development: `exp://localhost:8081/--/auth/callback` (for Expo Go)
- Production: `your-app-scheme://auth/callback`

### Deep Linking Not Working

1. Rebuild your app after adding the plugin:
   ```bash
   npx expo prebuild --clean
   ```

2. Verify your `app.json` has the `scheme` field:
   ```json
   {
     "expo": {
       "scheme": "myapp"
     }
   }
   ```

### Tokens Not Persisting

Expo SecureStore requires the app to be installed (doesn't work in Expo Go on Android). Build a development build:

```bash
npx expo run:ios
# or
npx expo run:android
```

## 📱 Platform Support

- ✅ iOS (13.0+)
- ✅ Android (API 21+)
- ✅ Expo Go (with limitations on Android SecureStore)
- ✅ EAS Build
- ✅ Bare React Native (with Expo modules)

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📄 License

MIT © Scalekit Inc.

## 🔗 Links

- [Scalekit Dashboard](https://app.scalekit.com)
- [Scalekit Documentation](https://docs.scalekit.com)
- [Example App](https://github.com/scalekit-inc/expo-scalekit-sample)
- [Report Issues](https://github.com/scalekit-inc/scalekit-expo-sdk/issues)

## 💬 Support

- 📧 Email: support@scalekit.com
- 📖 Docs: [docs.scalekit.com](https://docs.scalekit.com)

---

Made with ❤️ by [Scalekit](https://scalekit.com)
