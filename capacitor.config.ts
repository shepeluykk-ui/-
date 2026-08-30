import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ru.skkit.stroycontrol',
  appName: 'СК-КИТ',
  webDir: 'dist',
  server: {
    // In production APK, all API calls route to the live HTTPS backend
    // androidScheme: 'https' ensures safe local asset loading and secure fetch
    androidScheme: 'https',
    cleartext: false
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  plugins: {
    CapacitorHttp: {
      enabled: false
    }
  }
};

export default config;
