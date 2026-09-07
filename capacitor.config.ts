import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'mozo.papaya.com.pe',
  appName: 'Papaya App Mozo',
  webDir: 'dist/pwa-app-pedido-mozo',
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
  // ponytail: solo para probar contra el backend local por http desde el celular; quitar para produccion (https)
  android: { allowMixedContent: true },
};

export default config;
