# Example App

This example demonstrates how simple it is to add Scalekit authentication to your Expo app using `@scalekit-sdk/expo`.

## 🎯 Before & After Comparison

### ❌ Without SDK (Manual Implementation)

**~500 lines of code across multiple files:**

- Implement PKCE crypto functions (~100 lines)
- Handle token exchange (~80 lines)
- Manage secure storage (~60 lines)
- Create auth context (~150 lines)
- Configure deep linking manually
- Build login/home screens (~110 lines)

### ✅ With @scalekit-sdk/expo

**~30 lines of code in a single file:**

```tsx
import { ScalekitProvider, useScalekit } from '@scalekit-sdk/expo';

export default function App() {
  return (
    <ScalekitProvider
      envUrl="https://your-env.scalekit.com"
      clientId="your_client_id"
      clientSecret="your_client_secret"
    >
      <AppScreen />
    </ScalekitProvider>
  );
}

function AppScreen() {
  const { login, logout, user, isAuthenticated } = useScalekit();

  if (isAuthenticated) {
    return (
      <View>
        <Text>Welcome, {user?.name}!</Text>
        <Button title="Logout" onPress={logout} />
      </View>
    );
  }

  return <Button title="Login" onPress={login} />;
}
```

**That's 94% less code!** 🎉

## 🚀 Running This Example

### 1. Clone the Repository

```bash
git clone https://github.com/scalekit-inc/scalekit-expo-sdk.git
cd scalekit-expo-sdk/example
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Scalekit

Create a `.env` file:

```env
EXPO_PUBLIC_SCALEKIT_ENV_URL=https://your-env.scalekit.com
EXPO_PUBLIC_SCALEKIT_CLIENT_ID=your_client_id
EXPO_PUBLIC_SCALEKIT_CLIENT_SECRET=your_client_secret
```

### 4. Update app.json

Ensure your `app.json` has a scheme configured:

```json
{
  "expo": {
    "name": "Scalekit Example",
    "slug": "scalekit-example",
    "scheme": "scalekitexample",
    "plugins": [
      "@scalekit-sdk/expo"
    ]
  }
}
```

### 5. Configure Redirect URI in Scalekit Dashboard

Add this redirect URI to your Scalekit application:

- Development: `exp://localhost:8081/--/auth/callback`
- Production: `scalekitexample://auth/callback`

### 6. Run the App

```bash
# Using Expo Go
npm start

# iOS Simulator
npm run ios

# Android Emulator
npm run android
```

## 📝 Code Breakdown

### Simple 3-Step Integration

**Step 1: Wrap with Provider**
```tsx
<ScalekitProvider
  envUrl="..."
  clientId="..."
  clientSecret="..."
>
```

**Step 2: Use the Hook**
```tsx
const { login, logout, user, isAuthenticated } = useScalekit();
```

**Step 3: Implement UI**
```tsx
{isAuthenticated ? (
  <Text>Welcome {user?.name}</Text>
) : (
  <Button onPress={login}>Login</Button>
)}
```

## 🎨 Customization

### Custom Login Options

```tsx
// Login with organization (B2B)
<Button onPress={() => login({ organizationId: 'org_123' })}>
  Login to Acme Corp
</Button>

// Login with specific connection
<Button onPress={() => login({ connectionId: 'conn_456' })}>
  Login with Google
</Button>
```

### Making API Calls

```tsx
const { getAccessToken } = useScalekit();

const fetchData = async () => {
  const token = await getAccessToken();

  const response = await fetch('https://api.example.com/data', {
    headers: { Authorization: `Bearer ${token}` }
  });

  return response.json();
};
```

### Protected Routes

```tsx
function ProtectedScreen() {
  const { isAuthenticated } = useScalekit();

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return <SecureContent />;
}
```

## 📊 Comparison Table

| Feature | Manual Implementation | With SDK |
|---------|---------------------|----------|
| Setup Time | 2-4 hours | 5 minutes |
| Lines of Code | ~500 | ~30 |
| Files Created | 8+ | 1 |
| PKCE Knowledge | Required | Not needed |
| Deep Linking Config | Manual | Automatic |
| Token Management | Manual | Automatic |
| Type Safety | DIY | Built-in |
| Maintenance | Your responsibility | Handled by SDK |

## 🔗 Related Links

- [Full Documentation](../README.md)
- [Scalekit Dashboard](https://app.scalekit.com)
- [API Reference](https://docs.scalekit.com)
- [Report Issues](https://github.com/scalekit-inc/scalekit-expo-sdk/issues)

## 💡 Tips

1. **Use Environment Variables**: Store credentials in `.env` files
2. **Test in Development Build**: SecureStore has limitations in Expo Go on Android
3. **Configure Redirect URIs**: Make sure they match in Scalekit dashboard
4. **Handle Errors**: Use the `error` property from `useScalekit()` hook

## 🆘 Need Help?

- 📧 Email: support@scalekit.com
- 💬 Discord: [Join our community](https://discord.gg/scalekit)
- 📖 Docs: [docs.scalekit.com](https://docs.scalekit.com)
