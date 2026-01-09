# Publishing @scalekit-sdk/expo to npm

This guide explains how to publish the Scalekit Expo SDK to npm.

## 📋 Prerequisites

1. **npm Account**: You need an npm account with publish permissions
   - If you don't have one: https://www.npmjs.com/signup
   - For organization packages (@scalekit-sdk): You need to be a member of the `scalekit-sdk` organization

2. **npm CLI**: Ensure you have npm installed
   ```bash
   npm --version  # Should be 8.0.0 or higher
   ```

3. **Authentication**: Login to npm
   ```bash
   npm login
   # Enter your username, password, and email
   ```

4. **Organization Access**: Verify you have access to @scalekit-sdk
   ```bash
   npm access ls-packages @scalekit-sdk
   ```

## 🚀 Publishing Steps

### 1. Prepare the Package

#### Install Dependencies

```bash
cd /path/to/scalekit-expo-sdk
npm install
```

#### Install Required Dev Dependencies

```bash
npm install --save-dev @expo/config-plugins typescript @types/react @types/react-native
```

#### Build the Package

```bash
npm run build
```

This compiles TypeScript files to JavaScript in the `build/` directory.

### 2. Test the Package Locally

Before publishing, test the package locally:

```bash
# Create a tarball
npm pack

# This creates a file like: scalekit-sdk-expo-1.0.0.tgz
```

Install in a test project:

```bash
cd /path/to/test-expo-app
npm install /path/to/scalekit-expo-sdk/scalekit-sdk-expo-1.0.0.tgz
```

Test that everything works as expected.

### 3. Version Management

Update version in `package.json`:

```bash
# Patch release (1.0.0 → 1.0.1)
npm version patch

# Minor release (1.0.0 → 1.1.0)
npm version minor

# Major release (1.0.0 → 2.0.0)
npm version major
```

This automatically:
- Updates version in package.json
- Creates a git commit
- Creates a git tag

### 4. Publish to npm

#### First Time Publishing

If this is the first time publishing the package:

```bash
npm publish --access public
```

The `--access public` flag is required for scoped packages (@scalekit-sdk/expo).

#### Subsequent Publishes

```bash
npm publish
```

### 5. Verify Publication

Check that the package was published:

```bash
npm view @scalekit-sdk/expo
```

Visit the package page:
https://www.npmjs.com/package/@scalekit-sdk/expo

### 6. Push to GitHub

```bash
git push origin main --tags
```

## 🔄 Update Workflow

For subsequent releases:

1. Make changes to the code
2. Update CHANGELOG.md with changes
3. Build the package: `npm run build`
4. Test locally
5. Update version: `npm version patch/minor/major`
6. Publish: `npm publish`
7. Push to GitHub: `git push origin main --tags`

## 📦 Package Structure for npm

The published package includes:

```
@scalekit-sdk/expo/
├── build/              # Compiled JavaScript & type definitions
│   ├── index.js
│   ├── index.d.ts
│   ├── ScalekitProvider.js
│   ├── ScalekitProvider.d.ts
│   └── ...
├── plugin/             # Expo config plugin
│   └── src/
│       └── index.ts
├── src/               # Source TypeScript files
├── package.json
├── README.md
└── LICENSE
```

## 🏷️ npm Tags

Use tags for different release channels:

```bash
# Latest stable (default)
npm publish

# Beta version
npm publish --tag beta

# Next version
npm publish --tag next
```

Users can install specific tags:

```bash
npm install @scalekit-sdk/expo@beta
npm install @scalekit-sdk/expo@next
```

## 🔐 Security Best Practices

1. **Use 2FA**: Enable two-factor authentication on your npm account
   ```bash
   npm profile enable-2fa
   ```

2. **Use npm Tokens**: For CI/CD, use automation tokens
   ```bash
   npm token create --read-only  # For installs
   npm token create             # For publishing
   ```

3. **Review Before Publishing**: Always review changes before publishing
   ```bash
   npm pack --dry-run
   ```

## 📊 Post-Publish Checklist

After publishing:

- [ ] Verify package on npmjs.com
- [ ] Test installation: `npm install @scalekit-sdk/expo`
- [ ] Update documentation if needed
- [ ] Announce release on social media
- [ ] Update example apps to use new version
- [ ] Create GitHub release with changelog
- [ ] Monitor for issues/bug reports

## 🐛 Troubleshooting

### Error: "You must be logged in to publish packages"

```bash
npm login
```

### Error: "Package already exists"

You're trying to publish a version that already exists. Update the version:

```bash
npm version patch
```

### Error: "You do not have permission to publish"

Make sure you're a member of the @scalekit-sdk organization on npm.

### Error: "No description" or "No repository field"

Update package.json with missing fields.

### Build Errors

```bash
# Clean and rebuild
rm -rf build node_modules
npm install
npm run build
```

## 📝 Semantic Versioning

Follow [semver](https://semver.org/):

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features, backward compatible
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, backward compatible

## 🔗 Related Commands

```bash
# View package info
npm view @scalekit-sdk/expo

# View all versions
npm view @scalekit-sdk/expo versions

# View latest version
npm view @scalekit-sdk/expo version

# Unpublish a version (within 72 hours)
npm unpublish @scalekit-sdk/expo@1.0.0

# Deprecate a version
npm deprecate @scalekit-sdk/expo@1.0.0 "Use version 1.0.1 or higher"
```

## 🎯 CI/CD Integration

Example GitHub Action for automated publishing:

```yaml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## 📚 Additional Resources

- [npm Documentation](https://docs.npmjs.com/)
- [Publishing to npm](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [npm CLI Reference](https://docs.npmjs.com/cli/v8/commands)

---

For questions, contact: tech@scalekit.com
