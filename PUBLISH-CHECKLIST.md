# @scalekit-sdk/expo - Publishing Checklist

Complete guide for publishing the SDK to npm and updating dependent repositories.

## 📋 Pre-Publishing Checklist

### 1. Code Quality & Testing

- [ ] All TypeScript code compiles without errors
  ```bash
  cd /path/to/scalekit-expo-sdk
  npm run build
  ```

- [ ] No console errors or warnings in build output

- [ ] Test locally with sample app
  ```bash
  cd /path/to/expo-auth-sample
  npx expo start --clear
  # Test login flow on physical device
  ```

- [ ] Verify all features work:
  - [ ] Login flow completes successfully
  - [ ] User information displays correctly
  - [ ] Logout clears session
  - [ ] Session persists across app restarts
  - [ ] Error handling works properly

### 2. Documentation Review

- [ ] README.md is accurate and complete
- [ ] API documentation is up to date
- [ ] Example code snippets are correct
- [ ] All links work (GitHub, npm, docs)
- [ ] Version numbers are consistent

### 3. Package Configuration

- [ ] `package.json` version is correct (e.g., `1.0.0`)
- [ ] All required files are listed in `files` array
- [ ] Dependencies are correctly specified
- [ ] Peer dependencies are correct
- [ ] Repository URL is correct
- [ ] License is specified (MIT)

### 4. Build & Package Verification

- [ ] Clean build directory
  ```bash
  rm -rf build node_modules
  npm install --legacy-peer-deps
  npm run build
  ```

- [ ] Verify build output exists
  ```bash
  ls -la build/
  # Should contain: index.js, index.d.ts, ScalekitProvider.js, etc.
  ```

- [ ] Create test package
  ```bash
  npm pack
  ```

- [ ] Inspect package contents
  ```bash
  tar -tzf scalekit-sdk-expo-1.0.0.tgz
  ```

- [ ] Verify package includes:
  - [ ] `build/` directory with compiled code
  - [ ] `src/` directory with source code
  - [ ] `plugin/` directory
  - [ ] `app.plugin.js`
  - [ ] `README.md`
  - [ ] `LICENSE`
  - [ ] `package.json`

---

## 🚀 Publishing Steps

### 5. Version Management

- [ ] Decide version bump (patch/minor/major)
  - **Patch (1.0.0 → 1.0.1)**: Bug fixes
  - **Minor (1.0.0 → 1.1.0)**: New features, backward compatible
  - **Major (1.0.0 → 2.0.0)**: Breaking changes

- [ ] Update version
  ```bash
  npm version patch  # or minor, or major
  ```
  This automatically:
  - Updates version in package.json
  - Creates git commit
  - Creates git tag

### 6. Final Verification

- [ ] Review git changes
  ```bash
  git log -1
  git show
  ```

- [ ] Ensure you're on main branch
  ```bash
  git branch
  ```

- [ ] Pull latest changes
  ```bash
  git pull origin main
  ```

### 7. npm Publishing

- [ ] Login to npm (if not already)
  ```bash
  npm login
  # Enter credentials for account with @scalekit-sdk access
  ```

- [ ] Verify npm credentials
  ```bash
  npm whoami
  ```

- [ ] Publish to npm (first time)
  ```bash
  npm publish --access public
  ```

- [ ] For subsequent publishes
  ```bash
  npm publish
  ```

- [ ] Verify publication succeeded
  ```bash
  npm view @scalekit-sdk/expo
  ```

### 8. Git Updates

- [ ] Push version commit and tags
  ```bash
  git push origin main --tags
  ```

- [ ] Create GitHub Release
  - Go to: https://github.com/scalekit-inc/scalekit-expo-sdk/releases/new
  - Select the version tag (e.g., `v1.0.0`)
  - Title: `v1.0.0 - Initial Release`
  - Description: Copy from CHANGELOG or write release notes
  - Publish release

---

## 📦 Post-Publishing Steps

### 9. Verify npm Package

- [ ] Check package page
  - Visit: https://www.npmjs.com/package/@scalekit-sdk/expo
  - Verify version, description, README

- [ ] Test installation in clean directory
  ```bash
  mkdir /tmp/test-scalekit-sdk
  cd /tmp/test-scalekit-sdk
  npm init -y
  npm install @scalekit-sdk/expo
  ls node_modules/@scalekit-sdk/expo
  ```

- [ ] Verify package contents
  ```bash
  ls -la node_modules/@scalekit-sdk/expo/
  # Should contain: build/, app.plugin.js, package.json, README.md
  ```

### 10. Update Sample App Repository

**IMPORTANT:** The sample app needs updates to use the published npm package.

- [ ] Switch to post-publish branch
  ```bash
  cd /path/to/expo-auth-sample
  git checkout post-publish
  ```

- [ ] Test that changes work
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  npx expo start --clear
  # Test on physical device
  ```

- [ ] Merge to main after testing
  ```bash
  git checkout main
  git merge post-publish
  git push origin main
  ```

- [ ] Delete post-publish branch
  ```bash
  git branch -d post-publish
  git push origin --delete post-publish
  ```

### 11. Update Documentation

- [ ] Update main Scalekit documentation
  - Add Expo SDK to integration guides
  - Link to npm package and GitHub repo
  - Add to supported platforms list

- [ ] Update Scalekit website
  - Add Expo to SDKs page
  - Update pricing/features if needed

- [ ] Create blog post (optional)
  - "Introducing Scalekit SDK for Expo"
  - Show before/after code comparison
  - Highlight 76% code reduction

### 12. Announce Release

- [ ] Social Media
  - [ ] Twitter/X: Announce with code snippet
  - [ ] LinkedIn: Share with use case
  - [ ] Dev.to/Hashnode: Write tutorial article

- [ ] Developer Communities
  - [ ] Expo Forums: Post announcement
  - [ ] React Native subreddit: Share (if relevant)
  - [ ] Your developer community/Slack

- [ ] Email Notifications
  - [ ] Email existing customers using Expo
  - [ ] Email leads who asked about Expo support

### 13. Monitor & Support

- [ ] Monitor npm download stats
  - https://npm-stat.com/charts.html?package=@scalekit-sdk/expo

- [ ] Watch GitHub for issues
  - https://github.com/scalekit-inc/scalekit-expo-sdk/issues

- [ ] Monitor Scalekit support channels
  - Check for integration questions
  - Respond to feedback

- [ ] Track metrics (Week 1)
  - npm downloads
  - GitHub stars
  - Issues opened/closed
  - Support tickets

---

## 🐛 Rollback Plan (If Issues Found)

### If Critical Bug Found Within 24 Hours

- [ ] Unpublish version (only within 72 hours of publish)
  ```bash
  npm unpublish @scalekit-sdk/expo@1.0.0
  ```

### If Bug Found After 24 Hours

- [ ] Deprecate broken version
  ```bash
  npm deprecate @scalekit-sdk/expo@1.0.0 "Critical bug - use 1.0.1 or higher"
  ```

- [ ] Fix bug and publish patch
  ```bash
  # Fix the bug
  npm version patch
  npm publish
  git push origin main --tags
  ```

---

## 📊 Success Metrics

Track these metrics to measure SDK adoption:

### Week 1
- [ ] npm downloads > 10
- [ ] GitHub stars > 5
- [ ] Zero critical bugs reported
- [ ] At least 1 customer successfully integrated

### Month 1
- [ ] npm downloads > 100
- [ ] GitHub stars > 20
- [ ] 5+ customers using in production
- [ ] Average integration time < 30 minutes

### Quarter 1
- [ ] npm downloads > 500
- [ ] 20+ customers using in production
- [ ] Featured in Expo showcase/newsletter
- [ ] 95%+ customer satisfaction

---

## 📝 Version History Template

Document each release:

```markdown
## v1.0.0 - 2026-01-09

**Initial Release**

Features:
- OAuth 2.0 with PKCE flow
- Automatic session management
- TypeScript support
- Expo config plugin for deep linking
- React hooks API (useScalekit)

Breaking Changes:
- N/A (initial release)

Bug Fixes:
- N/A (initial release)

Migration Guide:
- N/A (initial release)
```

---

## 🔗 Important Links

- **npm Package:** https://www.npmjs.com/package/@scalekit-sdk/expo
- **GitHub SDK:** https://github.com/scalekit-inc/scalekit-expo-sdk
- **GitHub Sample:** https://github.com/scalekit-inc/expo-scalekit-sample
- **Scalekit Docs:** https://docs.scalekit.com
- **Scalekit Dashboard:** https://app.scalekit.com

---

## ✅ Final Checklist Summary

Before publishing:
- [ ] Code compiles and builds
- [ ] Tests pass locally
- [ ] Documentation is accurate
- [ ] Version is bumped
- [ ] Package contents verified

Publishing:
- [ ] npm publish succeeds
- [ ] Package appears on npmjs.com
- [ ] Git tags pushed
- [ ] GitHub release created

After publishing:
- [ ] Sample app updated and tested
- [ ] Documentation updated
- [ ] Release announced
- [ ] Monitoring in place

---

**Estimated Time:** 2-3 hours (first release), 30-60 minutes (subsequent releases)

**Point of Contact:** tech@scalekit.com

**Last Updated:** 2026-01-09
