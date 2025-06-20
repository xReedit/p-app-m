import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'mozo.papaya.com.pe',
  appName: 'Papaya App Mozo',
  webDir: 'dist/pwa-app-pedido-mozo',
  bundledWebRuntime: false,    
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    },
    Preferences: {},
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  },
  cordova: {},
};

export default config;
