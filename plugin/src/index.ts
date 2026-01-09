/**
 * @scalekit-sdk/expo - Config Plugin
 *
 * Automatically configures deep linking for OAuth callbacks
 */

import { ConfigPlugin, withInfoPlist, withAndroidManifest } from '@expo/config-plugins';

/**
 * Plugin configuration options
 */
export interface ScalekitPluginProps {
  /**
   * Custom URL scheme for your app (optional)
   * If not provided, uses the app slug
   */
  scheme?: string;
}

/**
 * Scalekit Expo Config Plugin
 *
 * Automatically configures deep linking for OAuth callbacks
 */
const withScalekit: ConfigPlugin<ScalekitPluginProps | void> = (config, props = {}) => {
  const scheme = props.scheme || config.scheme || config.slug;

  if (!scheme) {
    throw new Error(
      '[Scalekit] No URL scheme found. Please set "scheme" in app.json or provide it in the plugin config.'
    );
  }

  // Configure iOS
  config = withInfoPlist(config, (config) => {
    const infoPlist = config.modResults;

    // Add URL schemes for deep linking
    if (!infoPlist.CFBundleURLTypes) {
      infoPlist.CFBundleURLTypes = [];
    }

    const urlTypes = infoPlist.CFBundleURLTypes as Array<{
      CFBundleTypeRole: string;
      CFBundleURLSchemes: string[];
      CFBundleURLName?: string;
    }>;

    // Check if scheme already exists
    const existingScheme = urlTypes.find((type) =>
      type.CFBundleURLSchemes?.includes(scheme)
    );

    if (!existingScheme) {
      urlTypes.push({
        CFBundleTypeRole: 'Editor',
        CFBundleURLSchemes: [scheme],
        CFBundleURLName: config.ios?.bundleIdentifier || config.slug,
      });
    }

    return config;
  });

  // Configure Android
  config = withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest.application?.[0];

    if (!mainApplication) {
      return config;
    }

    // Find the main activity
    const mainActivity = mainApplication.activity?.find(
      (activity) =>
        activity.$?.['android:name'] === '.MainActivity' ||
        activity['intent-filter']?.some((filter) =>
          filter.action?.some((action) => action.$?.['android:name'] === 'android.intent.action.MAIN')
        )
    );

    if (!mainActivity) {
      return config;
    }

    // Ensure intent-filter array exists
    if (!mainActivity['intent-filter']) {
      mainActivity['intent-filter'] = [];
    }

    // Check if deep link intent filter already exists
    const hasDeepLinkFilter = mainActivity['intent-filter'].some((filter) =>
      filter.data?.some((data: any) => data.$?.['android:scheme'] === scheme)
    );

    if (!hasDeepLinkFilter) {
      // Add deep link intent filter
      mainActivity['intent-filter'].push({
        action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
        category: [
          { $: { 'android:name': 'android.intent.category.DEFAULT' } },
          { $: { 'android:name': 'android.intent.category.BROWSABLE' } },
        ],
        data: [{ $: { 'android:scheme': scheme } }],
      });
    }

    return config;
  });

  return config;
};

export default withScalekit;
